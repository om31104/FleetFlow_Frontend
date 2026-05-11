// frontend/src/utils/exportUtils.js
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============ CSV EXPORTS ============

export const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Vehicles to CSV
export const exportVehiclesToCSV = (vehicles) => {
  const data = vehicles.map(v => ({
    'Vehicle ID': v.id,
    'Name': v.name,
    'Model': v.model,
    'License Plate': v.licensePlate,
    'Type': v.type,
    'Max Capacity (kg)': v.maxCapacity,
    'Odometer (km)': v.odometer,
    'Status': v.status,
    'Created': new Date(v.createdAt).toLocaleDateString(),
  }));
  exportToCSV(data, 'vehicles_export');
};

// Export Drivers to CSV
export const exportDriversToCSV = (drivers) => {
  const data = drivers.map(d => ({
    'Driver ID': d.id,
    'Name': d.name,
    'License Number': d.licenseNumber,
    'License Expiry': new Date(d.licenseExpiry).toLocaleDateString(),
    'Completion Rate (%)': d.completionRate.toFixed(1),
    'Safety Score': d.safetyScore.toFixed(1),
    'Complaints': d.noOfComplaints,
    'Duty Status': d.dutyStatus,
  }));
  exportToCSV(data, 'drivers_export');
};

// Export Trips to CSV
export const exportTripsToCSV = (trips, vehicles, drivers) => {
  const data = trips.map(t => {
    const vehicle = vehicles?.find(v => v.id === t.vehicleId);
    const driver = drivers?.find(d => d.id === t.driverId);
    const fuelCost = t.fuelRecords?.reduce((sum, record) => sum + (record.totalCost || 0), 0) || 0;
    
    return {
      'Trip ID': `T-${String(t.id).padStart(3, '0')}`,
      'Vehicle': vehicle?.name || 'N/A',
      'Driver': driver?.name || 'N/A',
      'Cargo Weight (kg)': t.cargoWeight,
      'Origin': t.origin,
      'Destination': t.destination,
      'Status': t.status,
      'Fuel Cost (Rs.)': fuelCost.toFixed(2),
      'Date': new Date(t.createdAt).toLocaleDateString(),
    };
  });
  exportToCSV(data, 'trips_export');
};

// Export Expenses to CSV
export const exportExpensesToCSV = (trips, vehicles) => {
  const data = trips.map(t => {
    const vehicle = vehicles?.find(v => v.id === t.vehicleId);
    const fuelCost = t.fuelRecords?.reduce((sum, record) => sum + (record.totalCost || 0), 0) || 0;
    const miscCost = 500; // placeholder
    
    return {
      'Trip ID': `T-${String(t.id).padStart(3, '0')}`,
      'Vehicle': vehicle?.name || 'N/A',
      'Distance (km)': t.finalOdometer || 'N/A',
      'Fuel Cost (Rs.)': fuelCost.toFixed(2),
      'Misc Cost (Rs.)': miscCost.toFixed(2),
      'Total Cost (Rs.)': (fuelCost + miscCost).toFixed(2),
      'Date': new Date(t.createdAt).toLocaleDateString(),
    };
  });
  exportToCSV(data, 'expenses_export');
};

// ============ PDF EXPORTS ============

export const exportTableToPDF = (tableElement, filename) => {
  const canvas = html2canvas(tableElement);
  canvas.then(image => {
    const imgData = image.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 280;
    const imgHeight = (image.height * imgWidth) / image.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  });
};

export const generateMonthlyExpenseReport = (trips, vehicles, drivers, month) => {
  const monthTrips = trips.filter(t => {
    const tripMonth = new Date(t.createdAt).getMonth();
    const tripYear = new Date(t.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();
    return tripMonth === month && tripYear === currentYear;
  });

  const totalFuel = monthTrips.reduce((sum, t) => {
    const fuelCost = t.fuelRecords?.reduce((total, record) => total + (record.totalCost || 0), 0) || 0;
    return sum + fuelCost;
  }, 0);

  const totalMisc = monthTrips.length * 500;
  const totalExpense = totalFuel + totalMisc;

  const pdf = new jsPDF();
  const monthName = new Date(2026, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Header
  pdf.setFontSize(20);
  pdf.text('Monthly Expense Report', 20, 20);
  
  pdf.setFontSize(12);
  pdf.text(`Month: ${monthName}`, 20, 30);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);

  // Summary Section
  pdf.setFontSize(14);
  pdf.text('Expense Summary', 20, 55);
  
  pdf.setFontSize(11);
  pdf.text(`Total Fuel Cost: Rs. ${totalFuel.toLocaleString()}`, 20, 65);
  pdf.text(`Total Misc Expenses: Rs. ${totalMisc.toLocaleString()}`, 20, 72);
  
  pdf.setFont(undefined, 'bold');
  pdf.text(`Total Expenses: Rs. ${totalExpense.toLocaleString()}`, 20, 82);
  pdf.setFont(undefined, 'normal');

  // Trip Details
  pdf.setFontSize(14);
  pdf.text('Trip Details', 20, 95);

  let yPos = 105;
  pdf.setFontSize(10);
  
  monthTrips.forEach((trip, index) => {
    const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
    const driver = drivers?.find(d => d.id === trip.driverId);
    const fuelCost = trip.fuelRecords?.reduce((sum, record) => sum + (record.totalCost || 0), 0) || 0;

    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(`Trip #${String(trip.id).padStart(3, '0')}`, 20, yPos);
    pdf.text(`Vehicle: ${vehicle?.name || 'N/A'}`, 30, yPos + 5);
    pdf.text(`Driver: ${driver?.name || 'N/A'}`, 30, yPos + 10);
    pdf.text(`Fuel: Rs. ${fuelCost.toFixed(2)} | Misc: Rs. 500`, 30, yPos + 15);
    
    yPos += 22;
  });

  pdf.save(`monthly_expense_report_${monthName.replace(' ', '_')}.pdf`);
};

// Quick export function with error handling
export const safeExportCSV = (data, filename, onError = null) => {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    exportToCSV(data, filename);
  } catch (error) {
    console.error('Export error:', error);
    if (onError) onError(error);
    else alert('Failed to export data');
  }
};

export const safeExportTableToPDF = (tableElement, filename, onError = null) => {
  try {
    if (!tableElement) {
      alert('No table to export');
      return;
    }
    exportTableToPDF(tableElement, filename);
  } catch (error) {
    console.error('PDF export error:', error);
    if (onError) onError(error);
    else alert('Failed to export PDF');
  }
};
