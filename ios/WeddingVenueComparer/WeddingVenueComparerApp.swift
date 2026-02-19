//
//  WeddingVenueComparerApp.swift
//  WeddingVenueComparer
//
//  Created by Daniel Cho on 2/18/26.
//

import SwiftUI
import FirebaseCore

@main
struct WeddingVenueComparerApp: App {
    @StateObject private var firebaseService = FirebaseService()
    
    init() {
        print("DEBUG: WeddingVenueComparerApp init")
        FirebaseApp.configure()
        print("DEBUG: Firebase configured")
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(firebaseService)
        }
    }
}
