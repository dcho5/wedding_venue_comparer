import SwiftUI

struct AuthView: View {
    @EnvironmentObject var firebaseService: FirebaseService
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var errorMessage: String?
    @State private var isLoading = false
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.40, green: 0.49, blue: 0.92), Color(red: 0.46, green: 0.29, blue: 0.64)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack {
                VStack(spacing: 20) {
                    Text("💍 Wedding Venue Comparer")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 6)
                    
                    VStack(spacing: 12) {
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.none)
                            .autocapitalization(.none)
                            .autocorrectionDisabled(true)
                            .padding(12)
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                            )
                            .cornerRadius(8)
                        
                        SecureField("Password", text: $password)
                            .textContentType(.password)
                            .padding(12)
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                            )
                            .cornerRadius(8)
                    }
                    
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    
                    Button(action: handleAuth) {
                        if isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text(isSignUp ? "Sign Up" : "Sign In")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(red: 0.40, green: 0.49, blue: 0.92))
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .disabled(email.isEmpty || password.isEmpty || isLoading)
                    
                    HStack(spacing: 4) {
                        Text(isSignUp ? "Have an account?" : "Need an account?")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Button(action: { isSignUp.toggle() }) {
                            Text(isSignUp ? "Sign In" : "Sign Up")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(Color(red: 0.40, green: 0.49, blue: 0.92))
                                .underline()
                        }
                    }
                }
                .padding(24)
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.12), radius: 20, x: 0, y: 10)
                .padding(.horizontal, 24)
                .frame(maxWidth: 420)
            }
        }
    }
    
    private func handleAuth() {
        isLoading = true
        errorMessage = nil
        
        Task {
            let result = isSignUp ?
            await firebaseService.signUp(email: email, password: password) :
            await firebaseService.signIn(email: email, password: password)
            
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success:
                    break
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(FirebaseService())
}
