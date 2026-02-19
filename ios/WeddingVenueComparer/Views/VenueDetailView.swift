import SwiftUI
import FirebaseFirestore
import FirebaseAuth
import UIKit

struct VenueDetailView: View {
    @Binding var venue: Venue
    @ObservedObject var firebaseService: FirebaseService
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingLightbox = false
    @State private var lightboxIndex = 0
    @State private var photos: [VenuePhoto] = []
    @State private var showingEdit = false
    @State private var showingDeleteConfirm = false
    @Environment(\.dismiss) var dismiss
    
    private static var photoCache: [String: [VenuePhoto]] = [:]
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                headerSection
                costBreakdownSection
                photosSection
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Venue Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") {
                    dismiss()
                }
            }
            
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button("Edit") {
                        showingEdit = true
                    }
                    Button("Delete", role: .destructive) {
                        showingDeleteConfirm = true
                    }
                } label: {
                    Image(systemName: "ellipsis")
                }
            }
        }
        .fullScreenCover(isPresented: $showingLightbox) {
            PhotoLightbox(
                photos: photos,
                currentIndex: $lightboxIndex,
                onDismiss: { showingLightbox = false }
            )
        }
        .task {
            await loadPhotos()
        }.alert("Delete Venue?", isPresented: $showingDeleteConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteVenue()
            }
        } message: {
            Text("This will permanently delete \"\(currentVenue.name)\" and all its photos.")
        }.sheet(isPresented: $showingEdit) {
            NavigationStack {
                VenueFormView(isPresented: $showingEdit, existingVenue: venue)
                    .environmentObject(firebaseService)
            }
        }
        .onChange(of: showingEdit) { _, isShowing in
            if !isShowing {
                if let venueId = venue.id {
                    Self.photoCache.removeValue(forKey: venueId)
                }
                Task { await loadPhotos() }
            }
        }
    }
    
    private var currentVenue: Venue {
        firebaseService.venues.first(where: { $0.id == venue.id }) ?? venue
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(currentVenue.name)
                .font(.title)
                .fontWeight(.bold)
            
            HStack {
                Label("\(currentVenue.guest_count) guests", systemImage: "person.2")
                Label("\(currentVenue.event_duration_hours.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(currentVenue.event_duration_hours)) : String(format: "%g", currentVenue.event_duration_hours))h duration", systemImage: "clock")
            }
            .font(.caption)
            .foregroundColor(.gray)
            
            if !currentVenue.notes.isEmpty {
                Text(currentVenue.notes)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
    }
    
    private var costBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cost Breakdown")
                .font(.headline)
            
            CostRow(label: "Venue Rental", amount: currentVenue.venue_rental_cost)
            CostRow(label: "Catering", amount: currentVenue.totalCatering)
            CostRow(label: "Bar Service", amount: currentVenue.totalBar)
            CostRow(label: "Coordinator", amount: currentVenue.coordinator_fee)
            CostRow(label: "Insurance", amount: currentVenue.event_insurance)
            CostRow(label: "Other Costs", amount: currentVenue.other_costs)
            
            Divider()
            
            HStack {
                Text("Total Cost")
                    .font(.headline)
                Spacer()
                Text(String(format: "$%.2f", currentVenue.totalCost))
                    .font(.headline)
                    .foregroundColor(.blue)
            }
            
            HStack {
                Text("Per Guest")
                    .font(.subheadline)
                Spacer()
                Text(String(format: "$%.2f", currentVenue.perGuestCost))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var photosSection: some View {
        Group {
            if !photos.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Photos (\(photos.count))")
                        .font(.headline)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                                Button {
                                    lightboxIndex = index
                                    showingLightbox = true
                                } label: {
                                    AsyncImage(url: URL(string: photo.url)) { image in
                                        image
                                            .resizable()
                                            .scaledToFill()
                                    } placeholder: {
                                        Color.gray.opacity(0.3)
                                    }
                                    .frame(width: 120, height: 120)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func loadPhotos() async {
        guard let venueId = venue.id,
              let uid = firebaseService.currentUser?.uid else {
            return
        }
        
        // Check cache first
        if let cachedPhotos = Self.photoCache[venueId] {
            await MainActor.run {
                self.photos = cachedPhotos
            }
            return
        }
        
        do {
            let snapshot = try await Firestore.firestore()
                .collection("users")
                .document(uid)
                .collection("venues")
                .document(venueId)
                .collection("photos")
                .order(by: "created_at", descending: false)
                .getDocuments()
            
            let loadedPhotos = snapshot.documents.compactMap { doc -> VenuePhoto? in
                try? doc.data(as: VenuePhoto.self)
            }
            
            await MainActor.run {
                self.photos = loadedPhotos
                Self.photoCache[venueId] = loadedPhotos
            }
        } catch {
            print("Error loading photos: \(error)")
        }
    }
    
    private func deleteVenue() {
        guard let venueId = venue.id else { return }
        
        Task {
            let result = await firebaseService.deleteVenue(venueId)
            switch result {
            case .success:
                firebaseService.loadVenues()
                dismiss()
            case .failure(let error):
                errorMessage = error.localizedDescription
            }
        }
    }
}

struct CostRow: View {
    let label: String
    let amount: Double
    
    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(String(format: "$%.2f", amount))
                .foregroundColor(.secondary)
        }
        .font(.subheadline)
    }
}

struct PhotoLightbox: View {
    let photos: [VenuePhoto]
    @Binding var currentIndex: Int
    let onDismiss: () -> Void
    
    @State private var dragOffset: CGSize = .zero
    @GestureState private var isDragging = false

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.black
                    .ignoresSafeArea()
                    .onTapGesture {
                        onDismiss()
                    }

                VStack(spacing: 0) {
                    HStack {
                        Spacer()
                        Button {
                            onDismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding()
                        }
                    }

                    if currentIndex < photos.count {
                        TabView(selection: $currentIndex) {
                            ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                                AsyncImage(url: URL(string: photo.url)) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: geometry.size.width, height: geometry.size.height)
                                        .clipped()
                                } placeholder: {
                                    ProgressView()
                                        .tint(.white)
                                }
                                .tag(index)
                            }
                        }
                        .tabViewStyle(.page(indexDisplayMode: .never))
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .offset(y: dragOffset.height)
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    if value.translation.height > 0 {
                                        dragOffset = value.translation
                                    }
                                }
                                .onEnded { value in
                                    if value.translation.height > 120 {
                                        onDismiss()
                                    } else {
                                        withAnimation(.spring()) {
                                            dragOffset = .zero
                                        }
                                    }
                                }
                        )
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        VenueDetailView(
            venue: .constant(Venue(
                name: "The Preserve at Canyon Lake",
                guest_count: 150,
                venue_rental_cost: 5000,
                catering_per_person: 75,
                bar_service_rate: 15
            )),
            firebaseService: FirebaseService()
        )
    }
}
