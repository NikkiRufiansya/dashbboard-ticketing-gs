import { useEffect, useState } from "react";



interface Customer {
  id: number;
  customer: string;
  application_name: string;
  android_bundle_id: string | null;
  ios_bundle_id: string | null;
  number_of_download: string | null;
  product: string | null;
  start_date: string | null;
  expired_date: string | null;
  technical_contact: string | null;
  sales_contact: string | null;
  partner: string | null;
  pic_partner: string | null;
}

export default function TableCustomer() {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setSelectedCustomer(null);
    setIsDetailOpen(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5; // jumlah row per page

  // filter state
  const [search, setSearch] = useState("");
  const [statusFilter] = useState("all");

  // filtering logic

  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const inText = (v?: string | null) => (v ?? "").toLowerCase();

    // gabungkan semua field text yang ingin dicari
    const haystack = [
      c.customer,
      c.application_name,
      c.number_of_download,
      c.product,
      c.expired_date,
    ]
      .map(inText)
      .join(" ");

    const matchSearch = haystack.includes(q);

    // kalau masih butuh statusFilter, sesuaikan logikanya
    const matchStatus =
      statusFilter === "all" || c.application_name === statusFilter;

    return matchSearch && matchStatus;
  });

  // pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };



  useEffect(() => {
    if (isDetailOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const fetchCustomers = async () => {
      try {
        const response = await fetch('https://hmc1.rml.co.id/api-customer-gs/api/data', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDetailOpen]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          Customer Guardsquare
        </h3>
        <div className="p-4 text-center text-gray-500">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          Customer Data
        </h3>
        <div className="p-4 text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Guardsquare
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Customer
            </th>
            <th scope="col" className="px-6 py-3">
              Application Name
            </th>
            <th scope="col" className="px-6 py-3">
              Number of Download
            </th>
            <th scope="col" className="px-6 py-3">
              Product
            </th>

            <th scope="col" className="px-6 py-3">
              Expired Date
            </th>

            <th scope="col" className="px-6 py-3">
              Action
            </th>

          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {customer.customer}
                </th>
                <td className="px-6 py-4">
                  {customer.application_name}
                </td>
                <td className="px-6 py-4">
                  {customer.number_of_download}
                </td>
                <td className="px-6 py-4">
                  {customer.product}
                </td>
                <td className="px-6 py-4">
                  {customer.expired_date}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openDetail(customer)}
                    className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={12} className="px-6 py-4 text-center">
                No customers found.
              </td>
            </tr>
          )}
          {isDetailOpen && selectedCustomer && (
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center"
              aria-modal="true"
              role="dialog"
            >
              <div
                className="absolute inset-0 bg-black/40"
                onClick={closeDetail}
              />
              <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Customer Detail
                  </h4>
                  <button
                    onClick={closeDetail}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4 text-sm text-gray-700 dark:text-gray-200 space-y-2">
                  <div className="flex justify-between"><span>Customer</span><span className="font-medium">{selectedCustomer.customer ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Application Name</span><span className="font-medium">{selectedCustomer.application_name ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Android Bundle ID</span><span className="font-medium">{selectedCustomer.android_bundle_id ?? "-"}</span></div>
                  <div className="flex justify-between"><span>iOS Bundle ID</span><span className="font-medium">{selectedCustomer.ios_bundle_id ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Number of Download</span><span className="font-medium">{selectedCustomer.number_of_download ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Product</span><span className="font-medium">{selectedCustomer.product ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Start Date</span><span className="font-medium">{selectedCustomer.start_date ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Expired Date</span><span className="font-medium">{selectedCustomer.expired_date ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Technical Contact</span><span className="font-medium">{selectedCustomer.technical_contact ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Sales Contact</span><span className="font-medium">{selectedCustomer.sales_contact ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Partner</span><span className="font-medium">{selectedCustomer.partner ?? "-"}</span></div>
                  <div className="flex justify-between"><span>PIC Partner</span><span className="font-medium">{selectedCustomer.pic_partner ?? "-"}</span></div>
                </div>
              </div>
            </div>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>

  );


}