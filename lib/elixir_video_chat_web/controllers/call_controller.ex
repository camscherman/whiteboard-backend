defmodule ElixirVideoChatWeb.CallController do
  use ElixirVideoChatWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end