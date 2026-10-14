defmodule Dogfood.MixProject do
  use Mix.Project

  def project do
    [
      app: :dogfood,
      version: "0.1.0",
      elixir: "~> 1.17",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  defp deps do
    [
      # Pin verificado en sesión (README rrrene/credo).
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false}
      # PENDIENTE sandbox: {:dialyxir, "~> 1.4", only: [:dev], runtime: false}
      # + .tool-versions con Elixir/OTP exactos (tarea 3.1 bloqueada: sin toolchain).
    ]
  end
end
