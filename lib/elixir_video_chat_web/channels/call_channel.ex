defmodule ElixirVideoChatWeb.CallChannel do
  use Phoenix.Channel

  def join("call:peer2peer", _auth_msg, socket) do
    {:ok, socket}
  end

  def handle_in("peer-message", %{"body" => body}, socket) do
    IO.puts("In Handle In")
    broadcast_from!(socket, "peer-message", %{body: body})
    {:noreply, socket}
  end
end