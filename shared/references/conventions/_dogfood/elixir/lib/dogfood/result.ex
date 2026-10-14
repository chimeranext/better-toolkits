defmodule Dogfood.Result do
  @moduledoc """
  Sample del dogfood `elixir@0.1.0`: pasa R1-R10 por construcción
  (@spec, `with`, tagged tuples, sin inspect, pipes cortos).
  """

  @spec fetch(map(), (-> {:ok, map()} | {:error, term()})) ::
          {:ok, map()} | {:error, term()}
  def fetch(input, loader) do
    with {:ok, record} <- loader.(),
         :ok <- validate(input, record) do
      {:ok, Map.put(record, :seen, true)}
    end
  end

  @spec validate(map(), map()) :: :ok | {:error, :forbidden}
  defp validate(%{role: :admin}, _record), do: :ok
  defp validate(_input, _record), do: {:error, :forbidden}
end
