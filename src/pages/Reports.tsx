import React from 'react';
import { FileDown, Calendar, AlertTriangle } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChartCard } from '../components/ChartCard';
import { EcoPredictionChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';

export const Reports: React.FC = () => {
  const { user } = useAuth();

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impact Analysis Report</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              line-height: 1.4;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              width: 100%;
              box-sizing: border-box;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header-bar h1 {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .header-bar .meta {
              text-align: right;
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
            }
            h2 {
              font-size: 14px;
              color: #0f172a;
              margin-top: 20px;
              margin-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            }
            .metric-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .metric-table th, .metric-table td {
              padding: 8px 12px;
              text-align: left;
              font-size: 11.5px;
              border-bottom: 1px solid #f1f5f9;
            }
            .metric-table th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #475569;
            }
            .metric-table td.val {
              font-weight: 700;
              color: #0f172a;
            }
            .alert-box {
              background-color: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 8px;
              padding: 12px;
              margin-top: 20px;
              font-size: 11px;
              color: #065f46;
              line-height: 1.5;
            }
            .footer-bar {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header-bar">
              <div>
                <h1>CarbonMind Ecological Impact Report</h1>
                <div style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 2px;">
                  Monthly Trajectory & Predictive Analysis
                </div>
              </div>
              <div class="meta">
                <div>User: ${user?.displayName || 'Eco Pioneer'}</div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
                <div>Status: Verified</div>
              </div>
            </div>
            
            <h2>📊 Performance Summary Metrics</h2>
            <table class="metric-table">
              <thead>
                <tr>
                  <th>Environmental Performance Metric</th>
                  <th>Value / Standing</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly Average Carbon Footprint</td>
                  <td class="val">359 kg CO₂</td>
                </tr>
                <tr>
                  <td>Total Ecological Offsets Logged</td>
                  <td class="val" style="color: #059669;">485 kg CO₂</td>
                </tr>
                <tr>
                  <td>AI Target Carbon Reduction Rate</td>
                  <td class="val" style="color: #10b981;">18.4%</td>
                </tr>
                <tr>
                  <td>Platform Onboarding Standing Rank</td>
                  <td class="val">Level ${user?.level || 1} Pioneer</td>
                </tr>
              </tbody>
            </table>

            <h2>📈 Historical Log & Projected Forecast</h2>
            <table class="metric-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Actual Footprint (kg CO₂)</th>
                  <th>Predicted Target (kg CO₂)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>January</td><td>420</td><td>420</td></tr>
                <tr><td>February</td><td>380</td><td>390</td></tr>
                <tr><td>March</td><td>395</td><td>380</td></tr>
                <tr><td>April</td><td>320</td><td>350</td></tr>
                <tr><td>May</td><td>280</td><td>310</td></tr>
                <tr><td>June (Projected)</td><td>--</td><td>260</td></tr>
                <tr><td>July (Projected)</td><td>--</td><td>220</td></tr>
                <tr><td>August (Projected)</td><td>--</td><td>200</td></tr>
              </tbody>
            </table>

            <div class="alert-box">
              <strong>AI Climate Insights Notice:</strong> Prediction algorithms utilize weekly meal composition logging and travel distance trends to dynamically forecast and project ecological targets. Reducing red meat frequency and optimizing transit preserves up to 40% carbon offsets.
            </div>

            <h2>🌿 Comprehensive Sustainability Benefits</h2>
            <table class="metric-table" style="margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="width: 30%;">Benefit Dimension</th>
                  <th>Description & Carbon Correlation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🌿 Environmental Impact</strong></td>
                  <td>Reduces global greenhouse gases, stabilizing local heat indexes and safeguarding critical natural habitats.</td>
                </tr>
                <tr>
                  <td><strong>💰 Economic Savings</strong></td>
                  <td>Minimizes fossil fuel and power reliance, reducing monthly utility tariffs and personal transport expenses.</td>
                </tr>
                <tr>
                  <td><strong>🍎 Health Benefits</strong></td>
                  <td>Active biking/walking improves cardiovascular health, while a plant-rich diet reduces processed meat health risks.</td>
                </tr>
                <tr>
                  <td><strong>👥 Community Benefits</strong></td>
                  <td>Strengthens community climate action coordination via localized green map networks and shared ecological targets.</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer-bar">
              © ${new Date().getFullYear()} CarbonMind AI Platform. All rights reserved. Confirmed environmental scorecard report sheet.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  // Mock Data
  const predictionData = [
    { name: 'Jan', actual: 420, predicted: 420 },
    { name: 'Feb', actual: 380, predicted: 390 },
    { name: 'Mar', actual: 395, predicted: 380 },
    { name: 'Apr', actual: 320, predicted: 350 },
    { name: 'May', actual: 280, predicted: 310 },
    { name: 'Jun', actual: null, predicted: 260 },
    { name: 'Jul', actual: null, predicted: 220 },
    { name: 'Aug', actual: null, predicted: 200 }
  ];

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="Impact Reports"
        description="Verify monthly footprint trajectories and review predictive AI target models."
      >
        <Button variant="primary" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-1.5">
          <FileDown className="h-4 w-4" /> Download PDF Report
        </Button>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Chart Box */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Footprint & Prediction Model"
            subtitle="Comparing logged footprints (Jan-May) vs AI forecasts (Jun-Aug) in kg CO₂"
          >
            <EcoPredictionChart data={predictionData} />
          </ChartCard>
        </div>

        {/* Action Panel details */}
        <div className="space-y-6">
          <Card variant="glass" className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
              Summary Metrics
            </h3>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-400">Monthly Avg Footprint</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">359 kg CO₂</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-400">Total Offsets logged</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-450">485 kg CO₂</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">AI Target reduction rate</span>
                <span className="font-bold text-primary-500">18.4%</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-4 bg-primary-500/5 border border-primary-500/10 flex gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-primary-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 font-sans">
              AI Prediction algorithms utilize your weekly meal composition logging and commute distance trends to refine these estimates.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Reports;
