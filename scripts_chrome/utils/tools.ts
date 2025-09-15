export function getWeekNumber(yourDate: string|Date) {
    // get today
    let currentdate = new Date(yourDate);
    // get the 1 january day
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    // get the number of today (currentdate - oneJan) would be epoch number and divide 1 day epoch number
    var numberOfDays = Math.floor((currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    // get the number of day + 1 + number of days and divide 1 week ( 170 / 7)
    return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
}

export function toSpreadsheetDate(jsDate: Date) {
    // Adjust for difference in epoch between JS and Excel
    const EXCEL_EPOCH = new Date(1899, 11, 30);
    const differenceInDays = (jsDate.getTime() - EXCEL_EPOCH.getTime()) / (1000 * 60 * 60 * 24);

    // Add 1 to account for the starting day (Dec 30, 1899 is day 0)
    return differenceInDays;
}


export function downloadAsFile(object: string, filename: string) {

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(object));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


/**
 * Selects an HTML table element and converts its data into a 2D array of strings.
 * Each inner array represents a row, and contains the text content of its cells.
 *
 * @returns {string[][] | null} A 2D array of strings representing the table data,
 * or null if the table element is not found.
 */
export function getTableDataAsArray(table: HTMLTableElement): string[][]|null {

    if (!table) {
        console.warn(`Table not found.`);
        return null;
    }

    const tableData = <string[][]>[];

    // Select all rows within the table, including header rows (if any) and body rows
    // Using 'tr' selector covers both thead/tbody/tfoot rows.
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const rowData = <string[]>[];
        // Select all cell elements within the current row (td for data cells, th for header cells)
        const cells = row.querySelectorAll('th, td');

        cells.forEach(cell => {
            // Get the text content of the cell and trim whitespace
            // @ts-ignore
            rowData.push(cell?.textContent.trim());
        });

        // Only add non-empty rows to the tableData array
        // This helps to skip rows that might just contain a single empty cell or no cells
        if (rowData.length > 0) {
            tableData.push(rowData);
        }
    });

    return tableData;
}