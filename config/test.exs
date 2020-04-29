use Mix.Config

# Configure your database
config :elixir_video_chat, ElixirVideoChat.Repo,
  username: "postgres",
  password: "postgres",
  database: "elixir_video_chat_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :elixir_video_chat, ElixirVideoChatWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn
