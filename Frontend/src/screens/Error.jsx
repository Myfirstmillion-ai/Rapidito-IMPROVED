import { Button } from "../components";

function Error() {
  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-8xl font-bold text-zinc-200">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página no encontrada</h2>
      <p className="text-zinc-500 mt-2 mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <Button
        type={"link"}
        path={"/"}
        title={"Volver al inicio"}
        classes={"max-w-xs"}
      />
    </div>
  );
}

export default Error;
