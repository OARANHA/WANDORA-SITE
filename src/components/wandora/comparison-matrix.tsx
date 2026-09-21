"use client";

import { COMPARISON_ROWS, MATRIX_LABEL } from "@/lib/wandora/diagnostic";

export function ComparisonSection() {
  return (
    <div className="matrix" aria-label="Matriz de decisão: chatbot, agente de IA e funcionário digital">
      <p className="r-lab">Chatbot × Agente de IA × Funcionário Digital</p>

      <div className="matrix-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col" style={{ width: "38%" }}>
                Cenário
              </th>
              <th scope="col">Chatbot</th>
              <th scope="col">Agente de IA</th>
              <th scope="col" className="hero-col">
                Funcionário Digital
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.cenario}>
                <th scope="row">{row.cenario}</th>
                <td>
                  <span className={`mx-pill ${row.chatbot}`}>
                    {MATRIX_LABEL[row.chatbot]}
                  </span>
                </td>
                <td>
                  <span className={`mx-pill ${row.agente}`}>
                    {MATRIX_LABEL[row.agente]}
                  </span>
                </td>
                <td>
                  <span className={`mx-pill ${row.funcionario}`}>
                    {MATRIX_LABEL[row.funcionario]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
