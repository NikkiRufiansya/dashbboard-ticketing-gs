import PageMeta from "../../components/common/PageMeta";
import TableCustomer from "../../components/customer/TableCustomer";


export default function CustomerData() {
 
  return (
    <>
      <PageMeta
        title="Dashboard Ticketing GuardSquare"
        description="This is dasboard ticketing guardsquare for RML"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <TableCustomer />
        </div>
      </div>
    </>
  );
}