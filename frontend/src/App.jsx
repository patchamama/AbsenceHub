import { useState, useEffect } from 'react'
import { t, getLanguage, setLanguage, getAvailableLanguages } from './utils/i18n'
import { getAllAbsences, getAbsenceTypes, getStatistics } from './services/absenceApi'
import './App.css'

function App() {
  const [absences, setAbsences] = useState([])
  const [absenceTypes, setAbsenceTypes] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage())

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [absencesRes, typesRes, statsRes] = await Promise.all([
          getAllAbsences(),
          getAbsenceTypes(),
          getStatistics(),
        ])

        setAbsences(absencesRes.data?.data || [])
        setAbsenceTypes(typesRes.data?.data || [])
        setStatistics(statsRes.data?.data || null)
      } catch (err) {
        setError(t('message.loadingError'))
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCurrentLanguage(lang)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)

      const [absencesRes, statsRes] = await Promise.all([
        getAllAbsences(),
        getStatistics(),
      ])

      setAbsences(absencesRes.data?.data || [])
      setStatistics(statsRes.data?.data || null)
    } catch (err) {
      setError(t('message.loadingError'))
      console.error('Error refreshing data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-gray-600 text-sm">{t('app.subtitle')}</p>
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {getAvailableLanguages().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('message.loadingError')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Section */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {t('stats.totalAbsences')}
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {statistics.total_absences}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {t('stats.uniqueEmployees')}
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {statistics.unique_employees}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {t('stats.byType')}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(statistics.by_type || {}).map(([type, count]) => (
                      <li key={type} className="text-sm text-gray-600">
                        {t(`absence.${type}`)}: <span className="font-bold">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Absences List Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{t('list.title')}</h2>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('form.submit')}
                </button>
              </div>

              {absences.length === 0 ? (
                <div className="p-6 text-center text-gray-500">{t('list.empty')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.serviceAccount')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.employeeName')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.type')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.startDate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.endDate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('list.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {absences.map((absence) => (
                        <tr key={absence.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {absence.service_account}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {absence.employee_fullname || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {t(`absence.${absence.absence_type}`)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(absence.start_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(absence.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">
                              {t('button.edit')}
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              {t('button.delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
