import SwiftUI
import FirebaseFirestore

struct VenueComparisonView: View {
    let venues: [Venue]
    @ObservedObject var firebaseService: FirebaseService
    @Environment(\.dismiss) var dismiss
    @State private var photos: [String: [VenuePhoto]] = [:]
    @State private var selectedMetric: ComparisonMetric = .cost

    enum ComparisonMetric: String, CaseIterable {
        case cost        = "💰 Cost"
        case rental      = "🏛️ Rental"
        case catering    = "🍽️ Catering"
        case bar         = "🍷 Bar"
        case coordinator = "📋 Coordinator"
        case insurance   = "🛡️ Insurance"
        case other       = "📦 Other"

        func value(for venue: Venue) -> Double {
            switch self {
            case .cost:        return venue.totalCost
            case .rental:      return venue.venue_rental_cost
            case .catering:    return venue.totalCatering
            case .bar:         return venue.totalBar
            case .coordinator: return venue.coordinator_fee
            case .insurance:   return venue.event_insurance
            case .other:       return venue.other_costs
            }
        }
    }

    // MARK: - Rank

    enum Rank {
        case best, worst, neutral

        var bg: Color {
            switch self {
            case .best:    return Color(red: 0.06, green: 0.73, blue: 0.51).opacity(0.10)
            case .worst:   return Color(red: 0.94, green: 0.27, blue: 0.27).opacity(0.07)
            case .neutral: return Color(.systemGray6)
            }
        }
        var border: Color {
            switch self {
            case .best:    return Color(red: 0.06, green: 0.73, blue: 0.51)
            case .worst:   return Color(red: 0.94, green: 0.27, blue: 0.27)
            case .neutral: return Color(.separator)
            }
        }
        var valueColor: Color {
            switch self {
            case .best:    return Color(red: 0.04, green: 0.50, blue: 0.36)
            case .worst:   return Color(red: 0.78, green: 0.15, blue: 0.15)
            case .neutral: return .primary
            }
        }
        var badge: String? {
            switch self {
            case .best:    return "Best Value"
            case .worst:   return "Most Expensive"
            case .neutral: return nil
            }
        }
        var badgeColor: Color {
            switch self {
            case .best:  return Color(red: 0.06, green: 0.73, blue: 0.51)
            case .worst: return Color(red: 0.94, green: 0.27, blue: 0.27)
            case .neutral: return .gray
            }
        }
    }

    private func rank(venue: Venue) -> Rank {
        let value = selectedMetric.value(for: venue)
        let all = venues.map { selectedMetric.value(for: $0) }
        guard let mn = all.min(), let mx = all.max(), mn != mx else { return .neutral }
        if value == mn { return .best }
        if value == mx { return .worst }
        return .neutral
    }

    // MARK: - Photos

    private func titlePhotoURL(for venue: Venue) -> URL? {
        guard let venueId = venue.id else { return nil }
        let venuePhotos = photos[venueId] ?? []
        if let titleURL = venue.title_photo, let url = URL(string: titleURL) { return url }
        if let first = venuePhotos.first, let url = URL(string: first.url) { return url }
        return nil
    }

    // MARK: - Body

    var body: some View {
        VStack(spacing: 0) {
            metricPicker
            Divider()
            GeometryReader { geo in
                let pickerHeight: CGFloat = 56
                let totalPadding: CGFloat = CGFloat(venues.count + 1) * 16
                let cardHeight = (geo.size.height - pickerHeight - totalPadding) / CGFloat(venues.count)

                TabView(selection: $selectedMetric) {
                    ForEach(ComparisonMetric.allCases, id: \.self) { metric in
                        ScrollView {
                            VStack(spacing: 16) {
                                ForEach(venues) { venue in
                                    ComparisonCard(
                                        venue: venue,
                                        metric: metric,
                                        photoURL: titlePhotoURL(for: venue),
                                        rank: rank(venue: venue)
                                    )
                                    .frame(height: max(110, cardHeight))
                                }
                            }
                            .padding(16)
                            .padding(.bottom, 8)
                        }
                        .tag(metric)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.25), value: selectedMetric)
            }
        }
        .navigationTitle("Compare Venues")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Done") { dismiss() }
            }
        }
        .task { await loadPhotos() }
    }

    private var metricPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(ComparisonMetric.allCases, id: \.self) { metric in
                    Button {
                        withAnimation(.easeInOut(duration: 0.18)) {
                            selectedMetric = metric
                        }
                    } label: {
                        Text(metric.rawValue)
                            .font(.subheadline.weight(selectedMetric == metric ? .semibold : .regular))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selectedMetric == metric ? Color.blue : Color(.secondarySystemBackground))
                            .foregroundColor(selectedMetric == metric ? .white : .primary)
                            .cornerRadius(20)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
    }

    private func loadPhotos() async {
        for venue in venues {
            guard let venueId = venue.id else { continue }
            let result = await firebaseService.getPhotos(venueId: venueId)
            if case .success(let venuePhotos) = result {
                await MainActor.run { photos[venueId] = venuePhotos }
            }
        }
    }
}

// MARK: - ComparisonCard

struct ComparisonCard: View {
    let venue: Venue
    let metric: VenueComparisonView.ComparisonMetric
    let photoURL: URL?
    let rank: VenueComparisonView.Rank

    private var durationString: String {
        venue.event_duration_hours.truncatingRemainder(dividingBy: 1) == 0
            ? String(Int(venue.event_duration_hours))
            : String(format: "%.1f", venue.event_duration_hours)
    }

    var body: some View {
        HStack(spacing: 0) {
            // Photo strip on the left
            ZStack(alignment: .bottomLeading) {
                Group {
                    if let url = photoURL {
                        CachedRemoteImage(url: url)
                            .scaledToFill()
                    } else {
                        PhotoPlaceholder()
                    }
                }
                .frame(width: 110)
                .frame(maxHeight: .infinity)
                .clipped()

                if let badge = rank.badge {
                    Text(badge)
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 4)
                        .background(rank.badgeColor)
                        .cornerRadius(20)
                        .padding(6)
                }
            }
            .frame(width: 110)
            .cornerRadius(12, corners: [.topLeft, .bottomLeft])

            // Content
            VStack(alignment: .leading, spacing: 6) {
                // Name + meta
                VStack(alignment: .leading, spacing: 2) {
                    Text(venue.name.isEmpty ? "Untitled" : venue.name)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                    Text("\(venue.guest_count) guests · \(durationString) hrs")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Divider()

                // Primary value
                Text(VenueUtils.formatMoney(metric.value(for: venue)))
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(rank.valueColor)

                // Secondary
                if metric == .cost {
                    Text(VenueUtils.formatMoney(venue.perGuestCost) + " / guest")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else {
                    HStack(spacing: 8) {
                        Text(VenueUtils.formatMoney(venue.totalCost) + " total")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("·")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(VenueUtils.formatMoney(venue.perGuestCost) + " / guest")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(rank.bg)
            .cornerRadius(12, corners: [.topRight, .bottomRight])
        }
        .frame(maxHeight: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(rank.border, lineWidth: 1.5)
        )
        .shadow(color: Color.black.opacity(0.07), radius: 6, x: 0, y: 3)
    }
}

// MARK: - Corner Radius Helper

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    NavigationStack {
        VenueComparisonView(
            venues: [
                Venue(name: "The Preserve at Canyon Lake", guest_count: 150, venue_rental_cost: 5000, catering_per_person: 75, bar_service_rate: 15),
                Venue(name: "Hillside Manor", guest_count: 120, venue_rental_cost: 4200, catering_per_person: 85, bar_service_rate: 20),
                Venue(name: "Garden Estate", guest_count: 200, venue_rental_cost: 7500, catering_per_person: 60, bar_service_rate: 12)
            ],
            firebaseService: FirebaseService()
        )
    }
}

#Preview("Dark Mode") {
    NavigationStack {
        VenueComparisonView(
            venues: [
                Venue(name: "The Preserve at Canyon Lake", guest_count: 150, venue_rental_cost: 5000, catering_per_person: 75, bar_service_rate: 15),
                Venue(name: "Hillside Manor", guest_count: 120, venue_rental_cost: 4200, catering_per_person: 85, bar_service_rate: 20),
                Venue(name: "Garden Estate", guest_count: 200, venue_rental_cost: 7500, catering_per_person: 60, bar_service_rate: 12)
            ],
            firebaseService: FirebaseService()
        )
    }
    .preferredColorScheme(.dark)
}