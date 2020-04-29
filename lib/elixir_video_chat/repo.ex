defmodule ElixirVideoChat.Repo do
  use Ecto.Repo,
    otp_app: :elixir_video_chat,
    adapter: Ecto.Adapters.Postgres
end
