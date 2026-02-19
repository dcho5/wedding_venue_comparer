import SwiftUI
import FirebaseStorage
import FirebaseFirestore
import ImageIO
import Combine

// MARK: - Sort Option

enum VenueSortOption: String, CaseIterable {
    case dateAdded = "Date Added"
    case name = "Name"
    case totalCost = "Total Cost"
}

// MARK: - VenueListView

struct VenueListView: View {
    @EnvironmentObject var firebaseService: FirebaseService
    @State private var searchText = ""
    @State private var showingAddVenue = false
    @State private var selectedVenue: Venue?
    @State private var showingSignOutConfirm = false
    @State private var statsCache: [String: (min: Double, max: Double)] = [:]
    @State private var compareIDs: Set<String> = []
    @State private var isComparing = false
    @State private var showingComparison = false
    @State private var sortOption: VenueSortOption = .dateAdded
    @State private var sortAscending = true
    @State private var venueToDelete: Venue?

    var filteredVenues: [Venue] {
        let nonEmpty = firebaseService.venues.filter { !$0.name.trimmingCharacters(in: .whitespaces).isEmpty }
        let searched = searchText.isEmpty ? nonEmpty : nonEmpty.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.notes.localizedCaseInsensitiveContains(searchText)
        }
        return searched.sorted { a, b in
            let result: Bool
            switch sortOption {
            case .dateAdded:    result = (a.created_at?.dateValue() ?? .distantPast) < (b.created_at?.dateValue() ?? .distantPast)
            case .name:         result = a.name.localizedCaseInsensitiveCompare(b.name) == .orderedAscending
            case .totalCost:    result = a.totalCost < b.totalCost
            }
            return sortAscending ? result : !result
        }
    }

    private func updateStatsCache() {
        let venues = filteredVenues
        let metrics: [(String, (Venue) -> Double)] = [
            ("venue_rental_cost", { $0.venue_rental_cost }),
            ("catering", { $0.totalCatering }),
            ("bar", { $0.totalBar }),
            ("coordinator_fee", { $0.coordinator_fee }),
            ("event_insurance", { $0.event_insurance }),
            ("other_costs", { $0.other_costs }),
            ("total", { $0.totalCost })
        ]
        var result: [String: (min: Double, max: Double)] = [:]
        for (key, valueFn) in metrics {
            let values = venues.map(valueFn)
            result[key] = (values.min() ?? 0, values.max() ?? 0)
        }
        statsCache = result
    }

    private func bindingForVenue(_ venue: Venue) -> Binding<Venue> {
        guard let index = firebaseService.venues.firstIndex(where: { $0.id == venue.id }) else {
            return .constant(venue)
        }
        return $firebaseService.venues[index]
    }

    private func deleteVenue(_ venue: Venue) {
        guard let id = venue.id else { return }
        Task {
            _ = await firebaseService.deleteVenue(id)
            await MainActor.run { firebaseService.loadVenues() }
        }
    }

    private func toggleCompare(_ venue: Venue) {
        guard let id = venue.id else { return }
        withAnimation(.easeInOut(duration: 0.15)) {
            if compareIDs.contains(id) {
                compareIDs.remove(id)
                if compareIDs.isEmpty { isComparing = false }
            } else if compareIDs.count < 3 {
                compareIDs.insert(id)
            }
        }
    }

    private func exitCompareMode() {
        withAnimation(.easeInOut(duration: 0.15)) {
            compareIDs.removeAll()
            isComparing = false
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            if firebaseService.venues.isEmpty {
                Text("No venues yet")
                    .font(.headline)
                Text("Add your first venue to get started")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                Text("No results")
                    .font(.headline)
                Text("Try a different search term")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .frame(maxHeight: .infinity, alignment: .center)
    }

    @ViewBuilder
    private var venueGrid: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 12)], spacing: 12) {
                ForEach(filteredVenues) { venue in
                    let id = venue.id ?? ""
                    let isSelected = compareIDs.contains(id)
                    let atLimit = compareIDs.count >= 3 && !isSelected

                    VenueCard(venue: venue, stats: statsCache, isSelected: isSelected)
                        .contentShape(Rectangle())
                        .opacity(atLimit ? 0.5 : 1.0)
                        .onTapGesture {
                            if isComparing {
                                toggleCompare(venue)
                            } else {
                                selectedVenue = venue
                            }
                        }
                        .onLongPressGesture {
                            if !isComparing {
                                withAnimation(.easeInOut(duration: 0.15)) {
                                    isComparing = true
                                }
                            }
                            toggleCompare(venue)
                        }
                        .contextMenu {
                            Button {
                                if !isComparing {
                                    withAnimation(.easeInOut(duration: 0.15)) {
                                        isComparing = true
                                    }
                                }
                                toggleCompare(venue)
                            } label: {
                                Label(isSelected ? "Remove from Compare" : "Add to Compare", systemImage: "arrow.left.arrow.right")
                            }
                            .disabled(atLimit)

                            Divider()

                            Button(role: .destructive) {
                                venueToDelete = venue
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 16)
        }
    }

    @ViewBuilder
    private var trailingToolbarItems: some View {
        if isComparing {
            Button("Compare") {
                showingComparison = true
            }
            .disabled(compareIDs.count < 2)
        } else {
            Button(action: { showingAddVenue = true }) {
                Image(systemName: "plus")
            }
        }
    }

    @ViewBuilder
    private var leadingToolbarItems: some View {
        if isComparing {
            Button("Done") {
                exitCompareMode()
            }
        } else {
            Menu {
                Menu {
                    Section("Sort By") {
                        ForEach(VenueSortOption.allCases, id: \.self) { option in
                            Button {
                                if sortOption == option {
                                    sortAscending.toggle()
                                } else {
                                    sortOption = option
                                    sortAscending = true
                                }
                            } label: {
                                HStack {
                                    Text(option.rawValue)
                                    if sortOption == option {
                                        Image(systemName: sortAscending ? "chevron.up" : "chevron.down")
                                    }
                                }
                            }
                        }
                    }
                } label: {
                    Label("Sort By", systemImage: "arrow.up.arrow.down")
                }

                Divider()

                Button(role: .destructive, action: { showingSignOutConfirm = true }) {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
            }
        }
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if filteredVenues.isEmpty {
                    emptyStateView
                } else {
                    venueGrid
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, placement: .toolbar)
            .refreshable {
                firebaseService.loadVenues()
            }
            .toolbar {
                ToolbarItem(placement: .principal) {
                    if isComparing {
                        VStack(spacing: 1) {
                            ViewThatFits(in: .horizontal) {
                                Text("Select Venues")
                                    .font(.headline)
                                Text("Select")
                                    .font(.headline)
                            }
                            ViewThatFits(in: .horizontal) {
                                Text("Choose 2–3 to compare")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Text("Select 2–3")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    } else {
                        ViewThatFits(in: .horizontal) {
                            Text("Wedding Venue Comparer")
                                .font(.headline)
                            Text("💍 Venues")
                                .font(.headline)
                        }
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    trailingToolbarItems
                }

                ToolbarItem(placement: .topBarLeading) {
                    leadingToolbarItems
                }
            }
            .sheet(isPresented: $showingAddVenue) {
                NavigationStack {
                    VenueFormView(isPresented: $showingAddVenue)
                }
            }
            .sheet(item: $selectedVenue) { venue in
                NavigationStack {
                    VenueDetailView(venue: bindingForVenue(venue), firebaseService: firebaseService)
                }
            }
            .sheet(isPresented: $showingComparison) {
                let venuesToCompare = firebaseService.venues.filter { compareIDs.contains($0.id ?? "") }
                NavigationStack {
                    VenueComparisonView(venues: venuesToCompare, firebaseService: firebaseService)
                }
            }
            .alert("Sign out?", isPresented: $showingSignOutConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    _ = firebaseService.signOut()
                }
            } message: {
                Text("You'll need to sign in again to access your venues.")
            }
            .alert("Delete Venue?", isPresented: Binding(
                get: { venueToDelete != nil },
                set: { if !$0 { venueToDelete = nil } }
            )) {
                Button("Cancel", role: .cancel) { venueToDelete = nil }
                Button("Delete", role: .destructive) {
                    if let venue = venueToDelete { deleteVenue(venue) }
                    venueToDelete = nil
                }
            } message: {
                Text("This will permanently delete \"\(venueToDelete?.name ?? "")\" and all its photos.")
            }
            .onAppear { updateStatsCache() }
            .onChange(of: searchText) { updateStatsCache() }
            .onChange(of: firebaseService.venues.count) { updateStatsCache() }
            .onChange(of: firebaseService.venues) { updateStatsCache() }
        }
    }
}

// MARK: - VenueCard

struct VenueCard: View {
    let venue: Venue
    let stats: [String: (min: Double, max: Double)]
    var isSelected: Bool = false

    private var cardShadow: Color { Color.black.opacity(0.08) }
    private var highlightNeutral: Color { Color.gray.opacity(0.12) }
    private var highlightLow: Color { Color(red: 0.06, green: 0.73, blue: 0.51).opacity(0.14) }
    private var highlightHigh: Color { Color(red: 0.94, green: 0.27, blue: 0.27).opacity(0.10) }

    private func highlight(for value: Double, key: String) -> (color: Color, border: Color) {
        guard let stat = stats[key] else { return (.clear, .clear) }
        if stat.min == 0 && stat.max == 0 { return (.clear, .clear) }
        if stat.min == stat.max { return (highlightNeutral, Color.gray.opacity(0.35)) }
        if value == stat.min { return (highlightLow, Color(red: 0.06, green: 0.73, blue: 0.51)) }
        if value == stat.max { return (highlightHigh, Color(red: 0.94, green: 0.27, blue: 0.27)) }
        return (.clear, .clear)
    }

    private func formatMoney(_ value: Double) -> String {
        String(format: "$%.2f", value)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack(alignment: .topTrailing) {
                VenueCardPhoto(venue: venue)
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(.white, .blue)
                        .padding(8)
                        .transition(.scale.combined(with: .opacity))
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(venue.name.isEmpty ? "Untitled" : venue.name)
                    .font(.headline)
                Text("\(venue.guest_count) guests • " + (venue.event_duration_hours.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(venue.event_duration_hours)) : String(format: "%.1f", venue.event_duration_hours)) + " hrs")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            VStack(spacing: 6) {
                VenueCostRow(label: "Rental", value: formatMoney(venue.venue_rental_cost), highlight: highlight(for: venue.venue_rental_cost, key: "venue_rental_cost"))
                VenueCostRow(label: "Catering", value: formatMoney(venue.totalCatering), highlight: highlight(for: venue.totalCatering, key: "catering"))
                VenueCostRow(label: "Bar", value: formatMoney(venue.totalBar), highlight: highlight(for: venue.totalBar, key: "bar"))
                VenueCostRow(label: "Coordinator", value: formatMoney(venue.coordinator_fee), highlight: highlight(for: venue.coordinator_fee, key: "coordinator_fee"))
                VenueCostRow(label: "Event Insurance", value: formatMoney(venue.event_insurance), highlight: highlight(for: venue.event_insurance, key: "event_insurance"))
                VenueCostRow(label: "Other", value: formatMoney(venue.other_costs), highlight: highlight(for: venue.other_costs, key: "other_costs"))
                VenueCostRow(label: "Total", value: formatMoney(venue.totalCost), highlight: highlight(for: venue.totalCost, key: "total"), isEmphasized: true)
            }

            Text("Per guest: \(formatMoney(venue.perGuestCost))")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color.blue : Color(red: 0.90, green: 0.93, blue: 0.97),
                        lineWidth: isSelected ? 2 : 1)
        )
        .shadow(color: isSelected ? Color.blue.opacity(0.15) : cardShadow, radius: 6, x: 0, y: 3)
        .scaleEffect(isSelected ? 0.97 : 1.0)
    }
}

// MARK: - VenueCardPhoto

struct VenueCardPhoto: View {
    let venue: Venue
    @State private var resolvedUrl: URL?
    @State private var isLoading = false

    private static let urlCache = NSCache<NSString, NSURL>()

    var body: some View {
        Group {
            if let url = resolvedUrl {
                CachedRemoteImage(url: url).id(url)
            } else if isLoading {
                ProgressView()
            } else {
                PhotoPlaceholder()
            }
        }
        .frame(height: 140)
        .frame(maxWidth: .infinity)
        .background(Color.gray.opacity(0.08))
        .clipped()
        .cornerRadius(8)
        .task(id: venue.id ?? venue.title_photo ?? "") {
            await resolvePhotoURL()
        }
    }

    private func resolvePhotoURL() async {
        resolvedUrl = nil
        isLoading = true
        defer { isLoading = false }
        guard let titlePhoto = venue.title_photo else { return }
        resolvedUrl = await urlFromValue(titlePhoto)
    }

    private func urlFromValue(_ value: String) async -> URL? {
        guard !value.isEmpty else { return nil }
        if let cached = VenueCardPhoto.urlCache.object(forKey: value as NSString) { return cached as URL }
        if let url = URL(string: value), url.scheme != nil {
            VenueCardPhoto.urlCache.setObject(url as NSURL, forKey: value as NSString)
            return url
        }
        if let url = await downloadURL(forPath: value) {
            VenueCardPhoto.urlCache.setObject(url as NSURL, forKey: value as NSString)
            return url
        }
        return nil
    }

    private func downloadURL(forPath path: String) async -> URL? {
        await withCheckedContinuation { continuation in
            Storage.storage().reference(withPath: path).downloadURL { url, _ in
                continuation.resume(returning: url)
            }
        }
    }
}

// MARK: - Supporting Views

struct PhotoPlaceholder: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.gray.opacity(0.12), Color.gray.opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: "photo")
                .font(.system(size: 28))
                .foregroundColor(.gray.opacity(0.6))
        }
    }
}

final class ImageCache {
    static let shared = NSCache<NSURL, UIImage>()
}

final class ImageLoader: ObservableObject {
    @Published var image: UIImage?
    @Published var didFail = false
    private let url: URL
    private var task: URLSessionDataTask?

    init(url: URL) { self.url = url }

    func load() {
        if let cached = ImageCache.shared.object(forKey: url as NSURL) { image = cached; return }
        task?.cancel()
        task = URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            guard let self else { return }
            if let data, let downsampled = downsample(data: data, maxPixelSize: 900) {
                ImageCache.shared.setObject(downsampled, forKey: self.url as NSURL)
                DispatchQueue.main.async { self.image = downsampled }
            } else {
                DispatchQueue.main.async { self.didFail = true }
            }
        }
        task?.resume()
    }

    private func downsample(data: Data, maxPixelSize: CGFloat) -> UIImage? {
        let options: [CFString: Any] = [
            kCGImageSourceShouldCache: false,
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixelSize
        ]
        guard let source = CGImageSourceCreateWithData(data as CFData, nil),
              let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}

struct CachedRemoteImage: View {
    let url: URL
    @StateObject private var loader: ImageLoader

    init(url: URL) {
        self.url = url
        _loader = StateObject(wrappedValue: ImageLoader(url: url))
    }

    var body: some View {
        Group {
            if let image = loader.image {
                Image(uiImage: image).resizable().scaledToFill()
            } else {
                ProgressView()
            }
        }
        .onAppear { loader.load() }
        .onChange(of: loader.didFail) { }
    }
}

struct VenueCostRow: View {
    let label: String
    let value: String
    let highlight: (color: Color, border: Color)
    var isEmphasized: Bool = false

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
        }
        .font(isEmphasized ? .subheadline.weight(.semibold) : .subheadline)
        .padding(.vertical, 6)
        .padding(.horizontal, 10)
        .background(highlight.color)
        .overlay(Rectangle().fill(highlight.border).frame(width: 4), alignment: .leading)
        .cornerRadius(8)
    }
}

// MARK: - Preview

#Preview {
    VenueListView()
        .environmentObject(FirebaseService())
}

extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
