/**
 * Triggers an immediate, automatic PDF report download on mobile and desktop devices.
 * 
 * Works cleanly on:
 * - iOS Safari (bypasses cross-origin <a download> restriction via same-origin Blob / attachment headers)
 * - Android Chrome (automatically saves to /sdcard/Download)
 * - Desktop browsers (saves directly to Downloads folder)
 */
export async function downloadReportFile(report: {
  id: string;
  report_number?: string;
  download_url?: string;
  view_url?: string;
  r2_url?: string;
  [key: string]: any;
}): Promise<boolean> {
  if (!report || !report.id) {
    console.error('[downloadReportFile] Invalid report object passed');
    return false;
  }

  const reportId = report.id;
  const rawNum = report.report_number || (report as any).reportNumber || reportId;
  const safeNum = String(rawNum).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Wellness_Diagnostic_Report_${safeNum}.pdf`;

  // Always use the same-origin backend download endpoint which serves
  // Content-Disposition: attachment; filename="..." headers.
  const endpoint = `/api/reports/${encodeURIComponent(reportId)}/download`;

  try {
    // Strategy 1: Fetch as binary Blob and create local object URL.
    // In HTML5, local blob: URLs are treated as same-origin by mobile browsers,
    // which guarantees that Safari and Chrome will trigger the native download dialog
    // with the exact filename supplied.
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf, application/octet-stream, */*',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const blobData = await response.blob();
      const pdfBlob = new Blob([blobData], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
          // ignore
        }
      }, 3000);
      return true;
    }
  } catch (err) {
    console.warn('[downloadReportFile] Blob fetch failed, falling back to direct navigation:', err);
  }

  // Strategy 2: Direct navigation / invisible anchor to the attachment endpoint
  // When an endpoint returns Content-Disposition: attachment, mobile browsers
  // start the file download without leaving or unloading the active web page.
  try {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = endpoint;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch (e) {}
    }, 2000);
    return true;
  } catch (err2) {
    console.warn('[downloadReportFile] Direct anchor failed:', err2);
  }

  // Strategy 3: Direct window location assignment
  try {
    window.location.assign(endpoint);
    return true;
  } catch (err3) {
    console.error('[downloadReportFile] All download strategies failed:', err3);
    return false;
  }
}

