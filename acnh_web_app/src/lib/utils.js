
export function getReadableDate(month, day) {
    let dateString = ""

    let ending = ""
    if ([1, 21, 31].includes(day)) ending = "st"
    else if ([2, 22].includes(day)) ending = "nd"
    else if ([3, 23].includes(day)) ending = "rd"
    else ending = "th"

    const MONTH_ARRAY = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    dateString = MONTH_ARRAY[month - 1] + " " + day + ending

    return dateString
}

export function getReadableSeasonality(seasonality) {
    const MONTH_ARRAY = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let seasonalityMask = []
    let filteredMonthArray = []

    seasonalityMask = Array.from(seasonality).map((month) => parseInt(month))

    filteredMonthArray = MONTH_ARRAY.filter((month, i) => seasonalityMask[i])

    if (filteredMonthArray.length == 12) return "All year"

    
    return filteredMonthArray.join(", ")
}