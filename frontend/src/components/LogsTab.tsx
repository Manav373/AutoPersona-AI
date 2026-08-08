import React from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { RunLog, Agent } from '../types';

interface LogsTabProps {
  logs: RunLog[];
  agentsMap: Map<string, Agent>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, agentsMap }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="view-container">
        <div className="empty-state">
          <Terminal size={24} color="#5c5c7a" />
          <p>No execution logs recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="logs-view">
        {logs.map((log, i) => {
          const agent = agentsMap.get(log.agentId);
          const name = agent ? agent.persona.name : log.agentId.slice(0, 8);
          const time = new Date(log.startedAt).toLocaleTimeString();

          return (
            <motion.div
              key={i}
              className="log-row"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
            >
              <span className="log-time-col">[{time}]</span>
              <span className="log-agent-col">[{name}]</span>
              <span className={`log-outcome ${log.outcome}`}>
                {log.outcome.replace(/_/g, ' ')}
              </span>
              {log.detail && <span className="log-detail">{log.detail}</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
