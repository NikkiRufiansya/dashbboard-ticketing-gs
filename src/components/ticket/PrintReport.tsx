import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import env from '../../config/env';

interface Ticket {
  id: number;
  case_number: string;
  subject: string;
  customer: string;
  status: string;
  opened: string;
  closed: string | null;
  summary: string;
  duration_days: string;
  last_reply: string;
}

const CUSTOMERS = [
  { id: 'mandiri', name: 'Bank Mandiri' },
  { id: 'bni', name: 'Bank BNI' },
  { id: 'bsi', name: 'Bank Syariah Indonesia' }
];

const MONTH_OPTIONS = [
  { value: 1, label: '1 Bulan Terakhir' },
  { value: 2, label: '2 Bulan Terakhir' },
  { value: 3, label: '3 Bulan Terakhir' },
  { value: 6, label: '6 Bulan Terakhir' },
  { value: 12, label: '1 Tahun Terakhir' },
  { value: 0, label: 'Custom Range' }
];

const PrintReport: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: subMonths(new Date(), 1),
    endDate: new Date(),
    key: 'selection'
  });
  const [selectedMonthOption, setSelectedMonthOption] = useState(1);

  const navigate = useNavigate();

  const fetchTickets = async (customerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const params = new URLSearchParams({
        startDate: format(selectedRange.startDate, 'yyyy-MM-dd'),
        endDate: format(selectedRange.endDate, 'yyyy-MM-dd')
      });

      const response = await fetch(
        `${env.api.url}/tickets/export/${customerId}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        const errBody = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
        const message = typeof errBody === 'string' ? errBody.slice(0, 200) : (errBody.message || 'Failed to fetch tickets');
        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
      }

      const data = await response.json();
      if (data && data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      } else {
        throw new Error(data?.message || 'Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ setiap kali customer atau range berubah, otomatis fetch data baru
  useEffect(() => {
    if (selectedCustomer) {
      fetchTickets(selectedCustomer);
    }
  }, [selectedCustomer, selectedRange]);

  const handleMonthOptionChange = (months: number) => {
    setSelectedMonthOption(months);
    if (months > 0) {
      setSelectedRange({
        startDate: subMonths(new Date(), months),
        endDate: new Date(),
        key: 'selection'
      });
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateRangeChange = (ranges: any) => {
    setSelectedRange(ranges.selection);
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
    // fetch otomatis jalan karena useEffect
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-container, .print-container * {
          visibility: visible;
        }
        .print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print, .date-filter, .print-timestamp {
          display: none !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Trigger print
    window.print();
    
    // Remove the style after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleBack = () => {
    if (selectedCustomer) {
      setSelectedCustomer(null);
      setTickets([]);
    } else {
      navigate(-1);
    }
  };

  const renderDateFilter = () => (
    <div className="mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Filter Berdasarkan Tanggal</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {MONTH_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleMonthOptionChange(option.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedMonthOption === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showDatePicker && (
        <div className="mb-4">
          <DateRangePicker
            ranges={[selectedRange]}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            rangeColors={['#3b82f6']}
            locale={id}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-1 border rounded-md"
            >
              Batal
            </button>
            <button
              onClick={applyDateFilter}
              className="px-4 py-1 bg-blue-600 text-white rounded-md"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Periode yang dipilih:</p>
        <p className="font-medium">
          {format(selectedRange.startDate, 'dd MMMM yyyy', { locale: id })} -{' '}
          {format(selectedRange.endDate, 'dd MMMM yyyy', { locale: id })}
        </p>
      </div>
    </div>
  );

  if (!selectedCustomer) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CUSTOMERS.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer.id)}
              className="p-6 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="text-lg font-medium text-gray-900">
                {customer.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Klik untuk melihat laporan
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Memuat data tiket...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <button
          onClick={handleBack}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="no-print flex justify-end gap-2 mb-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Kembali
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Cetak Laporan
        </button>
      </div>
      
      <div className="print-container">

      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">
            Laporan Tiket GuardSquare - {CUSTOMERS.find(c => c.id === selectedCustomer)?.name}
          </h2>
          <p className="print-timestamp text-sm text-gray-500">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-sm text-gray-600">
            Total Tiket: {tickets.length}
          </p>
        </div>

        <div className="date-filter">
          {renderDateFilter()}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border w-12">
                  No.
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Nomor Tiket
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Subjek
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Dibuka
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Ditutup
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Durasi
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Terakhir dibalas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket, index) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-center border">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border">
                    {ticket.case_number}
                  </td>
                  <td className="px-4 py-2 border">{ticket.subject}</td>
                  <td className="px-4 py-2 whitespace-nowrap border">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'In Progress'
                          ? 'bg-orange-200 text-gray-800'
                          : ticket.status === 'Closed Confirmed'
                            ? 'bg-green-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border">
                    {formatDate(ticket.opened)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border">
                    {ticket.closed ? formatDate(ticket.closed) : '-'}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap border">
                    {ticket.duration_days} Hari
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border">
                    {ticket.last_reply}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PrintReport;