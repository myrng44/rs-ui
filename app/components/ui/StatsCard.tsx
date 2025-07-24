import { Card } from './Card';
import type {ReactNode} from "react";

interface StatsCardProps {
  title: string;
  value:string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  color?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color,
                                  }: StatsCardProps) {
  const changeClasses = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 mt-1 ${color || ""}`}>
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeClasses[changeType]}`}
              >
                {changeType === "positive" && "↗"}
                {changeType === "negative" && "↘"}
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="flex-shrink-0 ml-4 opacity-20">{icon}</div>}
      </div>
    </Card>
  );
}