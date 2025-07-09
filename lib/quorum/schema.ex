defmodule Quorum.Schema do
  @moduledoc """
  Base schema module that configures UUIDv7 as the default primary key type.

  All schemas in the application should use this module instead of Ecto.Schema directly:

      defmodule Quorum.Accounts.User do
        use Quorum.Schema
        
        schema "users" do
          field :email, :string
          field :name, :string
          
          timestamps()
        end
      end
  """

  defmacro __using__(_opts) do
    quote do
      use Ecto.Schema

      @primary_key {:id, UUIDv7.Type, autogenerate: true}
      @foreign_key_type UUIDv7.Type
      @timestamps_opts [type: :utc_datetime]
    end
  end
end
