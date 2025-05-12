import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SubjectDistribution } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "@/components/theme-provider";

export default function SubjectDistributionChart() {
  const { theme } = useTheme();
  
  // Fetch subject distribution data
  const { data: distribution, isLoading } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/analytics/subject-distribution`],
    enabled: true,
  });
  
  // Format data for pie chart
  const chartData = distribution?.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color
  })) || [];
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Subject Distribution</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-48 flex items-center justify-center mb-4">
          {isLoading ? (
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              Loading chart data...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-medium"
                  fill={theme === "dark" ? "#e5e7eb" : "#374151"}
                >
                  {chartData.length} subjects
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No subjects available
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="ml-auto h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              </div>
            ))
          ) : distribution?.map((item, index) => (
            <div className="flex items-center" key={index}>
              <span 
                className="subject-indicator mr-2 inline-block w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {item.name}
              </span>
              <span className="ml-auto text-sm font-medium text-gray-900 dark:text-white">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
