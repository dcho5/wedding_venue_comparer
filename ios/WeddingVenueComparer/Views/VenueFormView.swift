import SwiftUI
import PhotosUI

struct VenueFormView: View {
    @EnvironmentObject var firebaseService: FirebaseService
    @Binding var isPresented: Bool
    var existingVenue: Venue? = nil

    @State private var localVenue = Venue()
    @State private var isLoading = false
    @State private var isUploadingPhotos = false
    @State private var errorMessage: String?
    @State private var showingImagePicker = false
    @State private var selectedImages: [UIImage] = []
    @State private var existingPhotos: [VenuePhoto] = []
    @State private var titlePhotoId: String? = nil
    @State private var createdVenueId: String? = nil
    @State private var isNewVenue = false
    @State private var pendingDeletions: [VenuePhoto] = []

    private var isEditing: Bool { existingVenue != nil }

    private var activeVenueId: String? {
        isEditing ? localVenue.id : createdVenueId
    }

    private var titlePhotoURL: String? {
        existingPhotos.first(where: { $0.id == titlePhotoId })?.url
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Form {
                Section(header: Text("Name")) {
                    TextField("Venue Name", text: $localVenue.name)
                        .font(.title3.weight(.semibold))
                }

                Section(header: Text("Guest Count")) {
                    HStack(spacing: 8) {
                        Button(action: {
                            localVenue.guest_count = max(0, localVenue.guest_count - 1)
                        }) {
                            Image(systemName: "minus.circle")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                        Text("\(localVenue.guest_count)")
                            .frame(width: 40, alignment: .trailing)
                        Slider(
                            value: Binding(
                                get: { Double(localVenue.guest_count) },
                                set: { localVenue.guest_count = Int(($0 / 5).rounded()) * 5 }
                            ),
                            in: 0...250,
                            step: 5
                        )
                        .frame(maxWidth: 180)
                        Button(action: {
                            localVenue.guest_count = min(250, localVenue.guest_count + 1)
                        }) {
                            Image(systemName: "plus.circle")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                    }
                }

                Section(header: Text("Event Duration")) {
                    HStack(spacing: 8) {
                        Button(action: {
                            let newValue = localVenue.event_duration_hours - 0.5
                            localVenue.event_duration_hours = max(0, (newValue * 2).rounded() / 2)
                        }) {
                            Image(systemName: "minus.circle")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                        Text(localVenue.event_duration_hours.truncatingRemainder(dividingBy: 1) == 0
                             ? String(Int(localVenue.event_duration_hours))
                             : String(format: "%.1f", localVenue.event_duration_hours))
                            .frame(width: 40, alignment: .trailing)
                        Slider(
                            value: Binding(
                                get: { localVenue.event_duration_hours.rounded() },
                                set: { localVenue.event_duration_hours = $0.rounded() }
                            ),
                            in: 0...24,
                            step: 1
                        )
                        .frame(maxWidth: 180)
                        Button(action: {
                            let newValue = localVenue.event_duration_hours + 0.5
                            localVenue.event_duration_hours = min(24, (newValue * 2).rounded() / 2)
                        }) {
                            Image(systemName: "plus.circle")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                    }
                }

                Section(header: Text("Photos")) {
                    VStack(alignment: .leading, spacing: 12) {
                        if let titleURL = titlePhotoURL {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Title Photo")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                AsyncImage(url: URL(string: titleURL)) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 200)
                                        .clipped()
                                        .cornerRadius(10)
                                } placeholder: {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.gray.opacity(0.2))
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 200)
                                }
                            }
                        }

                        if !existingPhotos.isEmpty {
                            Text("Tap a photo to set as title photo")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(existingPhotos) { photo in
                                        let isSelected = titlePhotoId == photo.id
                                        AsyncImage(url: URL(string: photo.url)) { image in
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                                .frame(width: 80, height: 80)
                                                .clipped()
                                                .cornerRadius(8)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 8)
                                                        .stroke(Color.blue, lineWidth: isSelected ? 3 : 0)
                                                )
                                                .overlay(alignment: .topTrailing) {
                                                    if isSelected {
                                                        Image(systemName: "checkmark.circle.fill")
                                                            .foregroundColor(.blue)
                                                            .background(Color.white.clipShape(Circle()))
                                                            .offset(x: 6, y: -6)
                                                    }
                                                }
                                                // ← add this
                                                .overlay(alignment: .topLeading) {
                                                    Button {
                                                        Task { deletePhoto(photo) }
                                                    } label: {
                                                        Image(systemName: "xmark.circle.fill")
                                                            .foregroundStyle(.white, .black)
                                                            .offset(x: 0, y: -6)
                                                    }
                                                    .buttonStyle(.plain)
                                                }
                                        } placeholder: {
                                            RoundedRectangle(cornerRadius: 8)
                                                .fill(Color.gray.opacity(0.2))
                                                .frame(width: 80, height: 80)
                                        }
                                        .onTapGesture {
                                            titlePhotoId = photo.id
                                            localVenue.title_photo = photo.url
                                        }
                                    }
                                }
                                .padding(.vertical, 6)
                                .padding(.horizontal, 2)
                            }
                        }

                        if isUploadingPhotos {
                            HStack(spacing: 8) {
                                ProgressView()
                                Text("Uploading photos...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }

                        Button(action: { showingImagePicker = true }) {
                            Label("Upload Photos", systemImage: "photo.on.rectangle")
                        }
                        .disabled(isUploadingPhotos)
                    }
                    .padding(.vertical, 4)
                }

                Section(header: Text("Venue Costs")) {
                    CostInput(label: "Venue Rental", value: $localVenue.venue_rental_cost)
                }

                Section(header: Text("Catering Costs")) {
                    CostInput(label: "Per Person", value: $localVenue.catering_per_person)
                    CostInput(label: "Flat Fee", value: $localVenue.catering_flat_fee)
                }

                Section(header: Text("Bar Costs")) {
                    CostInput(label: "Per Person", value: $localVenue.bar_service_rate)
                    CostInput(label: "Flat Fee", value: $localVenue.bar_flat_fee)
                }

                Section(header: Text("Coordinator Fee")) {
                    CostInput(label: "Amount", value: $localVenue.coordinator_fee)
                }

                Section(header: Text("Event Insurance")) {
                    CostInput(label: "Amount", value: $localVenue.event_insurance)
                }

                Section(header: Text("Other Costs")) {
                    CostInput(label: "Amount", value: $localVenue.other_costs)
                }

                Section(header: Text("Notes")) {
                    TextEditor(text: $localVenue.notes)
                        .frame(height: 100)
                }

                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .sheet(isPresented: $showingImagePicker) {
                ImagePicker(images: $selectedImages)
            }
            .onChange(of: selectedImages) { _, newImages in
                guard let venueId = activeVenueId, !newImages.isEmpty else { return }
                let imagesToUpload = newImages
                selectedImages = []
                Task { await uploadImages(imagesToUpload, venueId: venueId) }
            }
            .safeAreaInset(edge: .bottom) {
                HStack {
                    Text("Total Cost")
                        .fontWeight(.bold)
                    Spacer()
                    Text("$\(String(format: "%.2f", localVenue.totalCost))")
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(16)
                .shadow(radius: 8)
                .padding([.horizontal, .bottom], 16)
            }
        }
        .navigationTitle(isEditing ? "Edit Venue" : "Add Venue")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") {
                    saveVenue()
                }
                .disabled(localVenue.name.isEmpty || isLoading || isUploadingPhotos)
            }
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") {
                    cancelAndCleanup()
                }
            }
        }
        .onAppear {
            if let existing = existingVenue {
                localVenue = existing
                Task { await loadPhotos(for: existing) }
            } else {
                Task { await createPlaceholderVenue() }
            }
        }
    }

    private func createPlaceholderVenue() async {
        let placeholder = Venue()
        let result = await firebaseService.addVenue(placeholder)
        if case .success(let venueId) = result {
            await MainActor.run {
                createdVenueId = venueId
                localVenue.id = venueId
                isNewVenue = true
            }
        }
    }

    private func uploadImages(_ images: [UIImage], venueId: String) async {
        await MainActor.run { isUploadingPhotos = true }
        for (idx, image) in images.enumerated() {
            guard let imageData = image.normalized().jpegData(compressionQuality: 0.8) else { continue }
            let fileName = "\(Int(Date().timeIntervalSince1970 * 1000))-\(idx).jpg"
            let result = await firebaseService.uploadPhoto(venueId: venueId, imageData: imageData, fileName: fileName)
            if case .success(let photo) = result {
                await MainActor.run {
                    existingPhotos.append(photo)
                }
            }
        }
        await MainActor.run { isUploadingPhotos = false }
    }

    private func loadPhotos(for venue: Venue) async {
        guard let venueId = venue.id else { return }
        let result = await firebaseService.getPhotos(venueId: venueId)
        if case .success(let photos) = result {
            await MainActor.run {
                existingPhotos = photos
                if let titleURL = venue.title_photo {
                    let match = photos.first(where: { $0.url == titleURL })
                        ?? photos.first(where: { photo in
                            guard !photo.file_path.isEmpty else { return false }
                            let encoded = photo.file_path.replacingOccurrences(of: "/", with: "%2F")
                            return titleURL.contains(encoded)
                        })
                    titlePhotoId = match?.id
                }
            }
        }
    }
    
    private func deletePhoto(_ photo: VenuePhoto) {
        existingPhotos.removeAll { $0.id == photo.id }
        pendingDeletions.append(photo)
        if titlePhotoId == photo.id {
            titlePhotoId = existingPhotos.first?.id
            localVenue.title_photo = existingPhotos.first?.url
        }
    }
    
    private func cancelAndCleanup() {
        if isNewVenue, let venueId = createdVenueId {
            Task {
                _ = await firebaseService.deleteVenue(venueId)
            }
        }
        isPresented = false
    }

    private func saveVenue() {
        isLoading = true
        errorMessage = nil

        Task {
            // Execute pending deletions
            for photo in pendingDeletions {
                _ = await firebaseService.deletePhoto(venueId: localVenue.id ?? "", photo: photo)
            }

            let result = await firebaseService.updateVenue(localVenue)
            await MainActor.run {
                isLoading = false
                switch result {
                case .success:
                    firebaseService.loadVenues()
                    isPresented = false
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }

    struct ImagePicker: UIViewControllerRepresentable {
        @Binding var images: [UIImage]
        @Environment(\.dismiss) var dismiss

        func makeUIViewController(context: Context) -> PHPickerViewController {
            var config = PHPickerConfiguration()
            config.filter = .images
            config.selectionLimit = 0
            let picker = PHPickerViewController(configuration: config)
            picker.delegate = context.coordinator
            return picker
        }

        func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

        func makeCoordinator() -> Coordinator {
            Coordinator(self)
        }

        class Coordinator: NSObject, PHPickerViewControllerDelegate {
            let parent: ImagePicker

            init(_ parent: ImagePicker) {
                self.parent = parent
            }

            func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
                parent.dismiss()
                for result in results {
                    result.itemProvider.loadObject(ofClass: UIImage.self) { object, _ in
                        if let image = object as? UIImage {
                            DispatchQueue.main.async {
                                self.parent.images.append(image)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct CostInput: View {
    let label: String
    @Binding var value: Double
    @State private var text: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            TextField("$0.00", text: $text)
                .keyboardType(.decimalPad)
                .padding(8)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
                .onAppear {
                    text = value == 0 ? "" : String(format: "%.2f", value)
                }
                .onChange(of: text) { _, newValue in
                    let filtered = newValue.filter { "0123456789.".contains($0) }
                    let decimalParts = filtered.split(separator: ".", omittingEmptySubsequences: false)
                    var result = ""
                    if decimalParts.count > 1 {
                        let integerPart = decimalParts[0]
                        let decimalPart = String(decimalParts[1].prefix(2))
                        result = "\(integerPart).\(decimalPart)"
                    } else {
                        result = filtered
                    }
                    if result != newValue {
                        self.text = result
                    }
                    if let doubleValue = Double(result) {
                        value = (doubleValue * 100).rounded() / 100
                    } else {
                        value = 0
                    }
                }
        }
    }
}

#Preview {
    NavigationStack {
        VenueFormView(isPresented: .constant(true))
            .environmentObject(FirebaseService())
    }
}
