import { PageMeta } from "../../components/layout/PageMeta";
import TableTicketClosedMandiri from "../../components/ticket/TableTicketClosedMandiri";
import TableTicketClosedBNI from "../../components/ticket/TableTicketClosedBNI";
import TableTicketClosedBSI from "../../components/ticket/TableTicketClosedBSI";
import TicketCardClosedMandiri from "../../components/ticket/TicketCardClosedMandiri";
import TicketCardClosedBNI from "../../components/ticket/TicketCardClosedBNI";
import TicketCardClosedBSI from "../../components/ticket/TicketCardClosedBSI";

export default function TicketClosed() {
  return (
    <>
      <PageMeta
        title="Tiket Tertutup - Dashboard Ticketing"
        description="Daftar tiket yang sudah ditutup"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-12">
          <TicketCardClosedMandiri />
          <TicketCardClosedBNI />
          <TicketCardClosedBSI />
        </div>
        <div className="col-span-12">
          <TableTicketClosedMandiri />
        </div>
        <div className="col-span-12">
          <TableTicketClosedBNI />
        </div>
        <div className="col-span-12">
          <TableTicketClosedBSI />
        </div>
      </div>
    </>
  );
}
          
