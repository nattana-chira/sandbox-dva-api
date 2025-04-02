// export const deleteTodo = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   await prisma.todo.delete({ where: { id: Number(id) } });
//   res.json({ message: 'Todo deleted' });
// };