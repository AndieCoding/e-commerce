import { OrderTicket } from "./order-ticket.js";

export class SimpleOrderTicket extends OrderTicket {
    constructor() {
        super();
    }

    getStyles() {
        return `
        ${super.getStyles()}
            <style>   
                div.ticket-container {
                    width: 100%;
                    display: flex;
                    justify-content: space-around;    
                    border: 1px solid #e0e0e0;                
                    box-sizing: border-box;
                    @media (max-width: 768px) {
                        flex-direction: column;
                        gap: 20px;
                    }
                }
                div.ticket-container:hover {
                    border-color: #4a854d;
                }
                div.body {
                    display:none;
                }
                .header{
                    flex: 1;    
                    flex-direction: row-reverse;
                    justify-content: start;
                    gap: 20px;
                    @media (max-width: 768px) {
                        font-size: 12px;
                        justify-content: space-around;
                     
                    }
                }
                .date {
                    font-size: 14px;
                }
                    .order-id {
                        @media (max-width: 768px) {
                            display:none;
                        }
                    }
                
                .footer{
                    flex: 1;                    
                    padding: 0;
                    margin: 0;
                    justify-content: end;
                    flex-direction: row-reverse;
                    gap: 20px;
                    @media (max-width: 768px) {
                        font-size: 12px;
                        justify-content: space-around;
                     
                    }
                }
                .total{
                    font-size: 14px;
                }
                .status-badge {                    
                    color: #333;                    
                    font-size: 10px;
                }
            </style>
        `;
    }

}

customElements.define('simple-order-ticket', SimpleOrderTicket);