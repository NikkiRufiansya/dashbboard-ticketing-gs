import PageMeta from "../../components/common/PageMeta";
import TicketCardMandiri from "../../components/ticket/TicketCardMandiri";
import TicketCardBNI from "../../components/ticket/TicketCardBNI";
import TicketCardBSI from "../../components/ticket/TicketCardBSI";
import TicketCardBRI from "../../components/ticket/TicketCardBRI";
import TableTicketMandiri from "../../components/ticket/TableTicketMandiri";
import TableTicketBNI from "../../components/ticket/TableTicketBNI";
import TableTicketBSI from "../../components/ticket/TableTicketBSI";

export default function Home() {
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
          <TableTicketMandiri />
        </div>
        <div className="col-span-12">
          <TableTicketBNI />
        </div>
        <div className="col-span-12">
          <TableTicketBSI />
        </div>
        <div className="col-span-12">
          
        </div>
      </div>
    </>
  );
}
