function DashboardCard({ titulo, valor }) {
  return (
    <div className="dashboard-card">
      <h3>{titulo}</h3>
      <p>{valor}</p>
    </div>
  );
}

export default DashboardCard;