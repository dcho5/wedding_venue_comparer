import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api"
    
    func verifyAuth(token: String) async -> Result<Bool, Error> {
        guard let url = URL(string: "\(baseURL)/auth/verify") else {
            return .failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"]))
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
            }
            
            return .success(httpResponse.statusCode == 200)
        } catch {
            return .failure(error)
        }
    }
    
    func getVenue(_ id: String, token: String) async -> Result<Venue, Error> {
        guard let url = URL(string: "\(baseURL)/venues/\(id)") else {
            return .failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"]))
        }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let venue = try JSONDecoder().decode(Venue.self, from: data)
            return .success(venue)
        } catch {
            return .failure(error)
        }
    }
}
