export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-bold text-ink-700">냉털키친</span> · 버리기 전에, 맛있게.
        </p>
        <p>© {new Date().getFullYear()} Fridge Kitchen</p>
      </div>
    </footer>
  )
}
