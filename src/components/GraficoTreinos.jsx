import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

function CursorPersonalizado({ x, y, width, height }) {
  const largura = Math.min(width, 110);

  return (
    <rect
      x={x + (width - largura) / 2}
      y={y}
      width={largura}
      height={height}
      fill="rgba(148, 163, 184, 0.18)"
    />
  );
}

function GraficoTreinos({ dados }) {
  return (
    <section className="grafico-container">
      <h2>📈 Quilometragem por Tipo de Treino</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={dados}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
          />

          <XAxis
            dataKey="nome"
            stroke="#334155"
            tick={{ fill: "#38bdf8" }}
          />

          <YAxis
            stroke="#cbd5e1"
             domain={[0, 25]}
          />

          <Tooltip 
            formatter={(value) => [`${value} km`, "📏 Distância"]}
            labelFormatter={(label) =>
              `${label === "Descanso" ? "🧘" : "🏃"} Tipo: ${label}`
            }
            cursor={<CursorPersonalizado />}
            allowEscapeViewBox={{ x: true }}
            offset={0}
            wrapperStyle={{ translate: "-50% -50%" }}
          />

          <Bar
            dataKey="distancia"
            fill="#38bdf8"
            radius={[8, 8, 0, 0]}
            maxBarSize={90}
          >
            <LabelList
              dataKey="distancia"
              position="insideTop"
              fill="#ffffff"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default GraficoTreinos;
