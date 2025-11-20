import PageMeta from "../../components/common/PageMeta";
import TicketCardMandiri from "../../components/ticket/TicketCardMandiri";
import TicketCardBNI from "../../components/ticket/TicketCardBNI";
import TicketCardBSI from "../../components/ticket/TicketCardBSI";
import TicketCardBRI from "../../components/ticket/TicketCardBRI";
import TableTicketAllMandiri from "../../components/ticket/TableTicketAllMandiri";
import TableTicketAllBNI from "../../components/ticket/TableTicketAllBNI";
import TableTicketAllBSI from "../../components/ticket/TableTicketAllBSI";


export default function Tickets() {
  return (
    <>
      <PageMeta
        title="Dashboard Ticketing GuardSquare"
        description="This is dasboard ticketing guardsquare for RML"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="grid grid-cols-4 gap-4 col-span-12 space-y-6 xl:col-span-12">
          <TicketCardMandiri />
          <TicketCardBNI />
          <TicketCardBSI />
          <TicketCardBRI />
        </div>
        <div className="col-span-12">
          <TableTicketAllMandiri />
        </div>
        <div className="col-span-12">
         <TableTicketAllBNI />
        </div>
        <div className="col-span-12">
          <TableTicketAllBSI />
        </div>
        <div className="col-span-12">
          
        </div>
      </div>
    </>
  );
}
