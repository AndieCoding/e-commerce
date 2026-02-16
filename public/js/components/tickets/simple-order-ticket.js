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
                    box-sizing: border-box;
                    @media (max-width: 768px) {
                        flex-direction: column;
                        gap: 20px;
                    }
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
                    background: #a6fcad5b;
                    color: #333;
                    outline: 1px solid #2d8b2dd2;
                    font-size: 10px;
                }
            </style>
        `;
    }

}

customElements.define('simple-order-ticket', SimpleOrderTicket);