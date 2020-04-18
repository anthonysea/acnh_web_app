
export function getHumanReadableDate(month, day) {
    let dateString = ""

    let ending = ""
    if ([1, 21, 31].includes(day)) ending = "st"
    else if ([2, 22].includes(day)) ending = "nd"
    else if ([3, 23].includes(day)) ending = "rd"
    else ending = "th"

    const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    dateString = monthArray[month - 1] + " " + day + ending

    return dateString
}