# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :elixir_video_chat,
  ecto_repos: [ElixirVideoChat.Repo]

# Configures the endpoint
config :elixir_video_chat, ElixirVideoChatWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "eoCYVfra1CNLeUkiPUxdcBFfaO5iMmlAAOFWjzxjVIDPUt+gRoBDFYFaOsB91bRO",
  render_errors: [view: ElixirVideoChatWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ElixirVideoChat.PubSub, adapter: Phoenix.PubSub.PG2],
  live_view: [signing_salt: "G20vv4ae"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
