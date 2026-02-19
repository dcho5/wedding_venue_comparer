import Foundation
import FirebaseFirestore

struct Venue: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    
    var name: String = ""
    var guest_count: Int = 100
    var event_duration_hours: Double = 12.0
    var venue_rental_cost: Double = 0.0
    var catering_per_person: Double = 0.0
    var catering_flat_fee: Double = 0.0
    var bar_service_rate: Double = 0.0
    var bar_flat_fee: Double = 0.0
    var coordinator_fee: Double = 0.0
    var event_insurance: Double = 0.0
    var other_costs: Double = 0.0
    var notes: String = ""
    var title_photo: String?
    var photos: [VenuePhoto] = []
    var created_at: Timestamp?
    var updated_at: Timestamp?
    
    enum CodingKeys: String, CodingKey {
        case name
        case guest_count
        case event_duration_hours
        case venue_rental_cost
        case catering_per_person
        case catering_flat_fee
        case bar_service_rate
        case bar_flat_fee
        case coordinator_fee
        case event_insurance
        case other_costs
        case notes
        case title_photo
        case photos
        case created_at
        case updated_at
    }
    
    // Computed properties
    var totalCost: Double {
        let cateringTotal = (catering_per_person * Double(guest_count)) + catering_flat_fee
        let barTotal = (bar_service_rate * Double(guest_count)) + bar_flat_fee
        return venue_rental_cost + cateringTotal + barTotal + coordinator_fee + event_insurance + other_costs
    }
    
    var perGuestCost: Double {
        guard guest_count > 0 else { return 0 }
        return totalCost / Double(guest_count)
    }
    
    var totalCatering: Double {
        return (catering_per_person * Double(guest_count)) + catering_flat_fee
    }
    
    var totalBar: Double {
        return (bar_service_rate * Double(guest_count)) + bar_flat_fee
    }
    
    static func == (lhs: Venue, rhs: Venue) -> Bool {
        lhs.id == rhs.id &&
        lhs.name == rhs.name &&
        lhs.guest_count == rhs.guest_count &&
        lhs.event_duration_hours == rhs.event_duration_hours &&
        lhs.venue_rental_cost == rhs.venue_rental_cost &&
        lhs.catering_per_person == rhs.catering_per_person &&
        lhs.catering_flat_fee == rhs.catering_flat_fee &&
        lhs.bar_service_rate == rhs.bar_service_rate &&
        lhs.bar_flat_fee == rhs.bar_flat_fee &&
        lhs.coordinator_fee == rhs.coordinator_fee &&
        lhs.event_insurance == rhs.event_insurance &&
        lhs.other_costs == rhs.other_costs &&
        lhs.notes == rhs.notes &&
        lhs.title_photo == rhs.title_photo &&
        lhs.photos == rhs.photos &&
        lhs.updated_at?.seconds == rhs.updated_at?.seconds
    }
}

struct VenuePhoto: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    var url: String = ""
    var file_path: String = ""
    var caption: String = ""
    var created_at: Timestamp?
}
