import { useState, useEffect } from 'react'
import { getTestOrder, getTestResultsByOrder, saveTestResult } from '../../services/testService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const TestResultForm = ({ testOrderId, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [testOrder, setTestOrder] = useState(null)
  const [results, setResults] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (testOrderId) {
      fetchTestOrder()
    }
  }, [testOrderId])

  const fetchTestOrder = async () => {
    try {
      const order = await getTestOrder(testOrderId)
      setTestOrder(order)

      const existingResults = await getTestResultsByOrder(testOrderId)
      const resultsMap = {}
      existingResults.forEach((result) => {
        resultsMap[result.test_id] = {
          result_value: result.result_value,
          reference_range: result.reference_range,
        }
      })
      setFormData(resultsMap)
      setResults(existingResults)
    } catch (error) {
      console.error('Error fetching test order:', error)
      toast.error('Failed to fetch test order')
    }
  }

  const handleChange = (testId, field, value) => {
    setFormData({
      ...formData,
      [testId]: {
        ...formData[testId],
        [field]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save each test result
      for (const testId of testOrder.tests || []) {
        const testData = formData[testId]
        if (testData && testData.result_value) {
          await saveTestResult(
            {
              test_order_id: testOrderId,
              test_id: testId,
              result_value: testData.result_value,
              reference_range: testData.reference_range || '',
              status: 'Draft',
            },
            userData.user_id
          )
        }
      }

      await logActivity(userData.user_id, 'test_result', 'create', testOrderId)
      toast.success('Test results saved successfully')
      onSuccess()
    } catch (error) {
      console.error('Error saving test results:', error)
      toast.error(error.message || 'Failed to save test results')
    } finally {
      setLoading(false)
    }
  }

  if (!testOrder) {
    return <div>Loading test order...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {(testOrder.tests || []).map((testId) => (
          <div key={testId} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">{testId}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Result Value"
                name={`${testId}_value`}
                type="number"
                step="0.01"
                value={formData[testId]?.result_value || ''}
                onChange={(e) =>
                  handleChange(testId, 'result_value', e.target.value)
                }
                required
              />
              <Input
                label="Reference Range"
                name={`${testId}_range`}
                value={formData[testId]?.reference_range || ''}
                onChange={(e) =>
                  handleChange(testId, 'reference_range', e.target.value)
                }
                placeholder="e.g., 3.5-5.5"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Results'}
        </Button>
      </div>
    </form>
  )
}

export default TestResultForm

