import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs, exportLogsToCSV } = useCloudX();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesQuery =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.appName && log.appName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedEventType === 'all' || log.eventType === selectedEventType;
    const matchesResult = selectedResult === 'all' || log.result === selectedResult;

    return matchesQuery && matchesType && matchesResult;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Activity &amp; Operating System Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive timestamped activity audit trail tracking requests, allocations, algorithm decisions, and recovery events.
          </p>
        </div>

        <button
          onClick={exportLogsToCSV}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs to CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-xs dark:shadow-none">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description, user, or app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Event Types</option>
            <option value="allocated">Resource Allocated</option>
            <option value="released">Resource Released</option>
            <option value="request_submitted">Request Submitted</option>
            <option value="deadlock_detected">Deadlock Detected</option>
            <option value="recovery_executed">Recovery Executed</option>
            <option value="server_created">Server Created</option>
            <option value="app_created">App Created</option>
          </select>

          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error / Alert</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">App / Resource</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-blue-700 dark:text-cyan-300 uppercase text-[11px]">{log.eventType.replace('_', ' ')}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-sans">{log.userName}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-sans">{log.appName || log.resourceName || '—'}</td>
                  <td className="py-3 px-3 text-slate-900 dark:text-slate-200 max-w-md font-sans text-xs leading-relaxed">{log.description}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                        log.result === 'success'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : log.result === 'error'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold'
                          : log.result === 'warning'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
