// Compound Ticket Component
// Follows React composition patterns - consumers compose pieces they need

import { TicketProvider, useTicketContext } from "./TicketProvider";
import { TicketFrame } from "./TicketFrame";
import { TicketHeader } from "./TicketHeader";
import { TicketContent } from "./TicketContent";
import { TicketResponse } from "./TicketResponse";
import { TicketActions } from "./TicketActions";

// Compound component namespace
const Ticket = {
    Provider: TicketProvider,
    Frame: TicketFrame,
    Header: TicketHeader,
    Content: TicketContent,
    Response: TicketResponse,
    Actions: TicketActions,
};

export { Ticket, useTicketContext };
export type { TicketProvider };
