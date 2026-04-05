import { useEffect, useMemo, useState } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis
} from "recharts"
import { getExtensiveReport, getLatestPredictions } from "../services/api"

const getAqiColor = (aqi) => {
    if (aqi <= 50) return "#00B050"
    if (aqi <= 100) return "#92D050"
    if (aqi <= 200) return "#FFFF00"
    if (aqi <= 300) return "#FFC000"
    if (aqi <= 400) return "#FF0000"
    return "#C00000"
}

const getAqiLabel = (aqi) => {
    if (aqi <= 50) return "Good"
    if (aqi <= 100) return "Satisfactory"
    if (aqi <= 200) return "Moderate"
    if (aqi <= 300) return "Poor"
    if (aqi <= 400) return "Very Poor"
    return "Severe"
}

const getChartWidth = (count) => Math.max(760, count * 140)

const round2 = (value) => {
    if (value === null || value === undefined) return "-"
    return Number(value).toFixed(2)
}

export default function ExtensiveReport() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [selectedCity, setSelectedCity] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                setError("")
                const [reportRows, latestRows] = await Promise.all([
                    getExtensiveReport(),
                    getLatestPredictions()
                ])

                const latestByCity = new Map(latestRows.map((row) => [row.city, row]))

                setData(
                    reportRows.map((row) => {
                        const latest = latestByCity.get(row.city) || {}

                        return {
                            ...row,
                            predicted_pm25: row.predicted_pm25 ?? latest.predicted_pm25 ?? null,
                            aqi: row.aqi ?? latest.aqi ?? null,
                            category: row.category ?? latest.category ?? null,
                            color: row.color ?? latest.color ?? null,
                            predicted_for: row.predicted_for ?? latest.predicted_for ?? null
                        }
                    })
                )
            } catch {
                setError("Could not load extensive report data.")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    useEffect(() => {
        if (!selectedCity && data.length > 0) {
            setSelectedCity(data[0].city)
        }
    }, [data, selectedCity])

    const summary = useMemo(() => {
        if (data.length === 0) return null

        const totalAqi = data.reduce((acc, row) => acc + row.aqi, 0)
        const avgAqi = totalAqi / data.length
        const worst = [...data].sort((a, b) => b.aqi - a.aqi)[0]
        const best = [...data].sort((a, b) => a.aqi - b.aqi)[0]

        return { avgAqi, worst, best }
    }, [data])

    const selectedRow = useMemo(
        () => data.find((row) => row.city === selectedCity),
        [data, selectedCity]
    )

    const cityAqiData = useMemo(
        () => [...data].sort((a, b) => b.aqi - a.aqi),
        [data]
    )

    const cityChartWidth = useMemo(() => getChartWidth(cityAqiData.length), [cityAqiData.length])

    const lagTrendData = useMemo(() => {
        if (!selectedRow) return []

        return [1, 2, 3, 4, 5, 6, 7].map((lag) => ({
            lag: `L${lag}`,
            pm25: selectedRow[`pm25_lag_${lag}`]
        }))
    }, [selectedRow])

    const cityAirMixData = useMemo(
        () =>
            data.map((row) => ({
                city: row.city,
                predicted_pm25:
                    row.predicted_pm25 === null || row.predicted_pm25 === undefined
                        ? null
                        : Number(row.predicted_pm25),
                pm25_roll_mean:
                    row.pm25_roll_mean === null || row.pm25_roll_mean === undefined
                        ? null
                        : Number(row.pm25_roll_mean),
                aqi: row.aqi === null || row.aqi === undefined ? null : Number(row.aqi)
            })),
        [data]
    )

    const mixChartWidth = useMemo(() => getChartWidth(cityAirMixData.length), [cityAirMixData.length])

    if (loading) {
        return <div className="p-8 text-slate-700">Loading report insights...</div>
    }

    if (error) {
        return <div className="p-8 text-red-600">{error}</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                    <h1 className="text-3xl font-bold md:text-4xl">AQI Insight Studio</h1>
                    <p className="mt-2 max-w-3xl text-slate-200">
                        Real-time feature intelligence from the extensive report with city-level risk,
                        lag behavior, and weather-to-pollution relationships.
                    </p>
                </div>

                {summary && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                            <p className="text-sm text-slate-500">Average AQI</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{round2(summary.avgAqi)}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                            <p className="text-sm text-slate-500">Highest Risk City</p>
                            <p className="mt-2 text-xl font-bold text-red-600">{summary.worst.city}</p>
                            <p className="text-sm text-slate-600">AQI {round2(summary.worst.aqi)}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                            <p className="text-sm text-slate-500">Lowest AQI City</p>
                            <p className="mt-2 text-xl font-bold text-emerald-600">{summary.best.city}</p>
                            <p className="text-sm text-slate-600">AQI {round2(summary.best.aqi)}</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">City AQI Comparison</h2>
                        <p className="mb-4 text-sm text-slate-500">Bars are colored by category severity.</p>
                        <div className="overflow-x-auto">
                            <div className="h-80" style={{ minWidth: `${cityChartWidth}px` }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cityAqiData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="city" interval={0} angle={-25} textAnchor="end" height={70} />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name, props) => [
                                                value === null || value === undefined
                                                    ? "-"
                                                    : name === "AQI"
                                                        ? `${Number(value).toFixed(2)} (${getAqiLabel(props.payload.aqi)})`
                                                        : Number(value).toFixed(2),
                                                name
                                            ]}
                                        />
                                        <Bar dataKey="aqi" name="AQI">
                                            {cityAqiData.map((row) => (
                                                <Cell
                                                    key={row.city}
                                                    fill={getAqiColor(row.aqi)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">PM2.5 Signal Mix by City</h2>
                        <p className="mb-4 text-sm text-slate-500">
                            Compare predicted PM2.5, rolling mean baseline, and AQI on separate scales.
                        </p>
                        <div className="overflow-x-auto">
                            <div className="h-80" style={{ minWidth: `${mixChartWidth}px` }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cityAirMixData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="city" interval={0} angle={-25} textAnchor="end" height={70} />
                                        <YAxis yAxisId="left" tickFormatter={(value) => `${value}`} />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                value === null || value === undefined ? "-" : Number(value).toFixed(2),
                                                name
                                            ]}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="predicted_pm25" fill="#14b8a6" name="Predicted PM2.5" />
                                        <Bar yAxisId="left" dataKey="pm25_roll_mean" fill="#60a5fa" name="7D PM2.5 Mean" />
                                        <Line yAxisId="right" type="monotone" dataKey="aqi" stroke="#0f172a" strokeWidth={2.5} name="AQI" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Selected City PM2.5 Lag Trend</h2>
                                <p className="text-sm text-slate-500">How recent lag values shape model context.</p>
                            </div>
                            <select
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                {data.map((row) => (
                                    <option key={row.city} value={row.city}>
                                        {row.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lagTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="lag" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="pm25" stroke="#f97316" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">Humidity vs AQI</h2>
                        <p className="mb-4 text-sm text-slate-500">Bubble size reflects 7-day PM2.5 volatility (std dev).</p>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="humidity_lag_1" name="Humidity" unit="%" />
                                    <YAxis dataKey="aqi" name="AQI" />
                                    <ZAxis dataKey="pm25_roll_std" range={[80, 400]} name="Volatility" />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                    <Scatter data={data} fill="#06b6d4" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
                    <h2 className="mb-3 text-lg font-bold text-slate-900">Compact Report Table</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                                <tr>
                                    <th className="px-3 py-2">City</th>
                                    <th className="px-3 py-2">AQI</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Pred PM2.5</th>
                                    <th className="px-3 py-2">7D Mean</th>
                                    <th className="px-3 py-2">PM2.5 Std</th>
                                    <th className="px-3 py-2">Temp L1</th>
                                    <th className="px-3 py-2">Humidity L1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.city} className="border-b border-slate-100">
                                        <td className="px-3 py-2 font-semibold text-slate-900">{row.city}</td>
                                        <td className="px-3 py-2">{round2(row.aqi)}</td>
                                        <td className="px-3 py-2">{row.category || getAqiLabel(row.aqi)}</td>
                                        <td className="px-3 py-2">{round2(row.predicted_pm25)}</td>
                                        <td className="px-3 py-2">{round2(row.pm25_roll_mean)}</td>
                                        <td className="px-3 py-2">{round2(row.pm25_roll_std)}</td>
                                        <td className="px-3 py-2">{round2(row.temp_lag_1)}</td>
                                        <td className="px-3 py-2">{round2(row.humidity_lag_1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
