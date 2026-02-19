import SwiftUI
import FirebaseAuth

struct ContentView: View {
    @EnvironmentObject var firebaseService: FirebaseService
    
    var body: some View {
        Group {
            if firebaseService.currentUser != nil {
                VenueListView()
            } else {
                AuthView()
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(FirebaseService())
}
