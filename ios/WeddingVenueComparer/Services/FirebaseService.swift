import Foundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage
import Combine

class FirebaseService: NSObject, ObservableObject {
    @Published var currentUser: User?
    @Published var venues: [Venue] = []
    @Published var errorMessage: String?
    
    private let auth = Auth.auth()
    private let db = Firestore.firestore()
    private var listenerRegistration: ListenerRegistration?
    private var authStateListener: AuthStateDidChangeListenerHandle?
    
    override init() {
        super.init()
        setupAuthStateListener()
        
        if let user = auth.currentUser {
            DispatchQueue.main.async {
                self.currentUser = user
                self.loadVenues()
            }
        }
    }
    
    private func setupAuthStateListener() {
        authStateListener = auth.addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                self?.currentUser = user
                if user != nil {
                    self?.loadVenues()
                } else {
                    self?.venues = []
                    self?.listenerRegistration?.remove()
                }
            }
        }
    }
    
    func signUp(email: String, password: String) async -> Result<Void, Error> {
        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            DispatchQueue.main.async { self.currentUser = result.user }
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func signIn(email: String, password: String) async -> Result<Void, Error> {
        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            DispatchQueue.main.async { self.currentUser = result.user }
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func signOut() -> Result<Void, Error> {
        do {
            try Auth.auth().signOut()
            DispatchQueue.main.async { self.currentUser = nil }
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func loadVenues() {
        guard let uid = currentUser?.uid else { return }
        Task {
            do {
                let snapshot = try await db.collection("users")
                    .document(uid)
                    .collection("venues")
                    .getDocuments()
                
                var decodedVenues: [Venue] = []
                var errors: [String] = []
                
                for doc in snapshot.documents {
                    do {
                        var venue = try doc.data(as: Venue.self)
                        venue.id = doc.documentID
                        if let titlePhoto = venue.title_photo, URL(string: titlePhoto)?.scheme == nil {
                            self.normalizeTitlePhoto(venueId: doc.documentID, path: titlePhoto)
                        }
                        decodedVenues.append(venue)
                    } catch {
                        errors.append("\(doc.documentID): \(error.localizedDescription)")
                    }
                }
                
                await MainActor.run {
                    self.venues = decodedVenues
                    if !errors.isEmpty {
                        self.errorMessage = "Decoded \(decodedVenues.count)/\(snapshot.documents.count). Errors: \(errors.joined(separator: "; "))"
                    } else {
                        self.errorMessage = nil
                    }
                }
            } catch {
                await MainActor.run { self.errorMessage = error.localizedDescription }
            }
        }
    }
    
    func addVenue(_ venue: Venue) async -> Result<String, Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            var v = venue
            v.created_at = Timestamp()
            v.updated_at = Timestamp()
            let ref = try db.collection("users")
                .document(uid)
                .collection("venues")
                .addDocument(from: v)
            return .success(ref.documentID)
        } catch {
            return .failure(error)
        }
    }
    
    func updateVenue(_ venue: Venue) async -> Result<Void, Error> {
        guard let uid = currentUser?.uid, let venueId = venue.id else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            var data: [String: Any] = [
                "name": venue.name,
                "guest_count": venue.guest_count,
                "event_duration_hours": venue.event_duration_hours,
                "venue_rental_cost": venue.venue_rental_cost,
                "catering_per_person": venue.catering_per_person,
                "catering_flat_fee": venue.catering_flat_fee,
                "bar_service_rate": venue.bar_service_rate,
                "bar_flat_fee": venue.bar_flat_fee,
                "coordinator_fee": venue.coordinator_fee,
                "event_insurance": venue.event_insurance,
                "other_costs": venue.other_costs,
                "notes": venue.notes,
                "updated_at": Timestamp()
            ]
            if let titlePhoto = venue.title_photo {
                data["title_photo"] = titlePhoto
            }
            try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .updateData(data)
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func updateTitlePhoto(venueId: String, photoUrl: String) async -> Result<Void, Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .updateData(["title_photo": photoUrl])
            return .success(())
        } catch {
            return .failure(error)
        }
    }

    private func normalizeTitlePhoto(venueId: String, path: String) {
        guard let uid = currentUser?.uid else { return }
        Storage.storage().reference(withPath: path).downloadURL { [weak self] url, error in
            guard let self, let url = url, error == nil else { return }
            Task {
                try? await self.db.collection("users")
                    .document(uid)
                    .collection("venues")
                    .document(venueId)
                    .updateData(["title_photo": url.absoluteString])
            }
        }
    }
    
    func deleteVenue(_ venueId: String) async -> Result<Void, Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            // 1. Fetch all photo records in the subcollection
            let photosSnapshot = try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .collection("photos")
                .getDocuments()

            // 2. Delete each photo from Storage and its Firestore record concurrently
            await withTaskGroup(of: Void.self) { group in
                for doc in photosSnapshot.documents {
                    let filePath = doc.data()["file_path"] as? String ?? ""
                    let docRef = doc.reference
                    group.addTask {
                        if !filePath.isEmpty {
                            try? await Storage.storage().reference(withPath: filePath).delete()
                        }
                        try? await docRef.delete()
                    }
                }
            }

            // 3. Delete the venue document itself
            try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .delete()

            return .success(())
        } catch {
            return .failure(error)
        }
    }

    func getPhotos(venueId: String) async -> Result<[VenuePhoto], Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            let snapshot = try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .collection("photos")
                .order(by: "created_at", descending: false)
                .getDocuments()
            let photos = snapshot.documents.compactMap { try? $0.data(as: VenuePhoto.self) }
            return .success(photos)
        } catch {
            return .failure(error)
        }
    }

    func deletePhotoRecord(venueId: String, photoId: String) async -> Result<Void, Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            try await db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .collection("photos")
                .document(photoId)
                .delete()
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func uploadPhoto(venueId: String, imageData: Data, fileName: String) async -> Result<VenuePhoto, Error> {
        guard let uid = currentUser?.uid else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        do {
            let filePath = "users/\(uid)/venues/\(venueId)/photos/\(fileName)"
            let ref = Storage.storage().reference().child(filePath)
            let metadata = StorageMetadata()
            metadata.contentType = "image/jpeg"
            let _ = try await ref.putDataAsync(imageData, metadata: metadata)
            let url = try await ref.downloadURL()
            var photo = VenuePhoto()
            photo.url = url.absoluteString
            photo.file_path = filePath
            photo.created_at = Timestamp()
            let photoRef = try db.collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .collection("photos")
                .addDocument(from: photo)
            photo.id = photoRef.documentID
            return .success(photo)
        } catch {
            return .failure(error)
        }
    }
    
    func deletePhotoFromStorage(photoPath: String) async -> Result<Void, Error> {
        do {
            try await Storage.storage().reference(withPath: photoPath).delete()
            return .success(())
        } catch {
            return .failure(error)
        }
    }
    
    func deletePhoto(venueId: String, photo: VenuePhoto) async -> Result<Void, Error> {
        guard let photoId = photo.id else {
            return .failure(NSError(domain: "FirebaseService", code: -1))
        }
        if !photo.file_path.isEmpty {
            _ = await deletePhotoFromStorage(photoPath: photo.file_path)
        }
        return await deletePhotoRecord(venueId: venueId, photoId: photoId)
    }
    
    deinit {
        listenerRegistration?.remove()
        if let handle = authStateListener {
            auth.removeStateDidChangeListener(handle)
        }
    }
}
