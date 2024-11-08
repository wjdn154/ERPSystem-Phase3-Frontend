import React, {useEffect, useState} from 'react'
import { BarChart, Users, Package, Truck, Leaf, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { menuItems } from '../../../../config/menuItems';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupsIcon from '@mui/icons-material/Groups';
import {Button} from "antd";

export default function DashboardPage({ initialData }) {
    const [reportData, setReportData] = useState({
        environmentalScore: {
            totalScore: 0,
            wasteScore: 0,
            energyScore: 0,
        },
        activities: [],
        salesData: [],
        widgets: [],
    });

    useEffect(() => {
        setReportData((prevData) => ({
            ...prevData,
            ...initialData,
            environmentalScore: {
                totalScore: initialData?.environmentalScore?.totalScore ?? prevData.environmentalScore.totalScore,
                wasteScore: initialData?.environmentalScore?.wasteScore ?? prevData.environmentalScore.wasteScore,
                energyScore: initialData?.environmentalScore?.energyScore ?? prevData.environmentalScore.energyScore,
            },
        }));
    }, [initialData]);

    return (
        <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-8xl my-10 mx-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <DashboardWidget icon={AttachMoneyIcon} title={reportData.widgets.financeName}  value={`₩${new Intl.NumberFormat('ko-KR').format(reportData.widgets.financeValue)}`} color="bg-blue-500" />
                    <DashboardWidget icon={GroupsIcon} title="총 직원 수" value={`${reportData.widgets.hrValue} 명`} color="bg-green-500" />
                    <DashboardWidget icon={LocalShippingIcon} title="재고 현황" value={`${new Intl.NumberFormat('ko-KR').format(reportData.widgets.logisticsValue)} 개`} color="bg-yellow-500" />
                    <DashboardWidget icon={PrecisionManufacturingIcon} title={reportData.widgets.productionName} value={`${new Intl.NumberFormat('ko-KR').format(reportData.widgets.productionValue)} EA`} color="bg-purple-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    <ChartCard title="매출 및 비용 추이">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={reportData.salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickFormatter={(value = '') => value || ''} />
                                <YAxis tickFormatter={(value = 0) => value || 0} />
                                <Tooltip />
                                <Legend
                                    payload={[
                                        { value: '매출', type: 'line', id: 'sales', color: '#3B82F6' },
                                        { value: '비용', type: 'line', id: 'cost', color: '#10B981' },
                                    ]}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="친환경 인증 현황">
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        className="text-gray-200 stroke-current"
                                        strokeWidth="10"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                    ></circle>
                                    <circle
                                        className="text-green-500 progress-ring__circle stroke-current"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={`${251.2 * (1 - reportData.environmentalScore.totalScore / 100)}`}
                                        transform="rotate(-90 50 50)"
                                    ></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        className="text-4xl font-bold text-green-500">{reportData.environmentalScore.totalScore}점</span>
                                    <span className="text-sm text-gray-500 mt-2">친환경 인증 점수</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-500">폐기물 비율</span>
                                <span
                                    className="text-sm font-medium text-green-500">{reportData.environmentalScore.wasteScore}점</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${reportData.environmentalScore.wasteScore}%`}}></div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-500">에너지 효율</span>
                                <span
                                    className="text-sm font-medium text-green-500">{reportData.environmentalScore.energyScore}점</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full"
                                     style={{width: `${reportData.environmentalScore.energyScore}%`}}></div>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* Additional dashboard content */}
                <div className="grid grid-cols-1 lg:grid-cols-1">
                    <Card title="최근 활동">
                        <ActivityTimeline reportData={reportData} />
                    </Card>
                </div>
            </div>
        </main>
    )
}

function DashboardWidget({icon: Icon, title, value, color}) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="text-lg font-bold text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {children}
        </div>
    )
}

function Card({ title, children }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{title}</h3>
                {children}
            </div>
        </div>
    )
}

function ActivityTimeline({reportData}) {
    const [activityShowAll, setActivityShowAll] = useState(false);
    const activitiesToShow = activityShowAll ? reportData.activities : reportData.activities.slice(0, 4);
    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {activitiesToShow.length > 0 ? activitiesToShow.map((item, itemIdx) => (
                    <li key={item.id}>
                        <div className="relative pb-8">
                            {itemIdx !== activitiesToShow.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                      aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                            item.activityType === 'FINANCE' ? 'bg-blue-500' :
                                                item.activityType === 'HR' ? 'bg-green-500' :
                                                    item.activityType === 'LOGISTICS' ? 'bg-yellow-500' : 'bg-purple-500'
                                        }`}
                                    >
                                        <ActivityIcon activityType={item.activityType} style={{width: '15px'}}
                                                      className="text-white"/>
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">{item.activityDescription}</p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={item.activityTime}>{item.activityTime}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                )) : (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-gray-400">활동 내역이 없습니다.</span>
                    </div>
                )}
            </ul>
            {reportData.activities.length > 4 && (
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={() => setActivityShowAll(!activityShowAll)}
                        type="primary"
                    >
                        {activityShowAll ? '간략히 보기' : '더보기'}
                    </Button>
                </div>
            )}
        </div>
    )
}

function ActivityIcon({activityType, ...props}) {
    switch (activityType) {
        case 'HR':
            return <GroupsIcon {...props} />
        case 'FINANCE':
            return <AttachMoneyIcon    {...props} />
        case 'PRODUCTION':
            return <PrecisionManufacturingIcon {...props} />
        case 'LOGISTICS':
            return <LocalShippingIcon {...props} />
        default:
            return <Package {...props} />
    }
}

function ProductionStatus() {
    const statuses = [
        {name: '생산 중', percentage: 65, color: 'bg-blue-500'},
        {name: '생산 완료', percentage: 30, color: 'bg-green-500'},
        {name: '생산 지연', percentage: 5, color: 'bg-red-500'},
    ]

    return (
        <div className="space-y-4">
            {statuses.map((status) => (
                <div key={status.name}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">{status.name}</span>
                        <span className="text-sm font-medium text-gray-900">{status.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`${status.color} h-2.5 rounded-full`}
                             style={{width: `${status.percentage}%`}}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}