import SwiftUI

struct HighlightUtils {
    /// Determines highlight color based on venue comparison
    /// Green = best (lowest/most favorable value)
    /// Red = worst (highest/least favorable value)
    /// Gray = all equal
    static func getHighlightColor(
        value: Double,
        allValues: [Double],
        venueCount: Int = 1
    ) -> Color {
        guard !allValues.isEmpty else { return .clear }
        let minValue = allValues.min() ?? 0
        let maxValue = allValues.max() ?? 0
        let allZero = minValue == 0 && maxValue == 0
        let allSame = minValue == maxValue

        if allZero {
            return .clear
        }
        if allSame {
            return .gray
        }
        if value == minValue {
            return .green
        }
        if value == maxValue && venueCount > 1 {
            return .red
        }
        return .clear
    }
    
    /// Returns a CSS-style class name for highlighting
    /// Used for consistency with web frontend
    static func getHighlightClass(
        value: Double,
        allValues: [Double],
        isInverted: Bool = false
    ) -> String {
        guard !allValues.isEmpty else { return "highlight-none" }
        
        let minValue = allValues.min() ?? 0
        let maxValue = allValues.max() ?? 0
        
        if minValue == maxValue {
            return "highlight-none"
        }
        
        if isInverted {
            if value == maxValue {
                return "highlight-best"
            } else if value == minValue {
                return "highlight-worst"
            } else {
                return "highlight-middle"
            }
        } else {
            if value == minValue {
                return "highlight-best"
            } else if value == maxValue {
                return "highlight-worst"
            } else {
                return "highlight-middle"
            }
        }
    }
}
