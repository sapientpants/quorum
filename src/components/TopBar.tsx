interface TopBarProps {
  title: string
}

function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-primary text-primary-content p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </header>
  )
}

export default TopBar 