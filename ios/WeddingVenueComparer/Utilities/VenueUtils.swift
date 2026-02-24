import SwiftUI

// MARK: - Formatting

struct VenueUtils {

    /// Formats a Double as a locale-aware currency string.
    /// Mirrors formatMoney() in web/src/venueUtils.js
    static func formatMoney(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = .current
        return formatter.string(from: NSNumber(value: value)) ?? "$\(value)"
    }

    // MARK: - Highlight Logic

    /// Determines highlight color based on venue comparison.
    /// Green = best (lowest cost), Red = worst (highest cost), Gray = all equal.
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

        if allZero   { return .clear }
        if allSame   { return .gray  }
        if value == minValue { return .green }
        if value == maxValue && venueCount > 1 { return .red }
        return .clear
    }

    /// Returns a class-name string for highlighting.
    /// Kept for consistency with web frontend naming conventions.
    static func getHighlightClass(
        value: Double,
        allValues: [Double],
        isInverted: Bool = false
    ) -> String {
        guard !allValues.isEmpty else { return "highlight-none" }
        let minValue = allValues.min() ?? 0
        let maxValue = allValues.max() ?? 0
        if minValue == maxValue { return "highlight-none" }

        if isInverted {
            if value == maxValue { return "highlight-best"   }
            if value == minValue { return "highlight-worst"  }
        } else {
            if value == minValue { return "highlight-best"   }
            if value == maxValue { return "highlight-worst"  }
        }
        return "highlight-middle"
    }
}