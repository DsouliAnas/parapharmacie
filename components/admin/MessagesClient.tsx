"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  CheckCheck,
  Mail,
  MailOpen,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagesClientProps {
  messages: Message[];
}

type FilterType = "all" | "unread" | "read";

export default function MessagesClient({
  messages: initialMessages,
}: MessagesClientProps) {
  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [selectedMessageId, setSelectedMessageId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const selectedMessage = messages.find(
    (message) =>
      message._id === selectedMessageId
  );

  const unreadCount = messages.filter(
    (message) => !message.isRead
  ).length;

  const filteredMessages = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return messages.filter((message) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !message.isRead) ||
        (filter === "read" && message.isRead);

      const matchesSearch =
        !normalizedSearch ||
        `${message.firstName} ${message.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        message.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        message.message
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [messages, search, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const openMessage = async (message: Message) => {
    setSelectedMessageId(message._id);

    if (message.isRead) {
      return;
    }

    try {
      await fetch(
        `/api/admin/messages/${message._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isRead: true,
          }),
        }
      );

      setMessages((previous) =>
        previous.map((item) =>
          item._id === message._id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error marking message as read:",
        error
      );
    }
  };

  const toggleRead = async (
    message: Message
  ) => {
    try {
      setLoadingId(message._id);

      const newReadState = !message.isRead;

      const response = await fetch(
        `/api/admin/messages/${message._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isRead: newReadState,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de modifier le message."
        );
      }

      setMessages((previous) =>
        previous.map((item) =>
          item._id === message._id
            ? {
                ...item,
                isRead: newReadState,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error updating message:",
        error
      );
    } finally {
      setLoadingId(null);
    }
  };

  const deleteMessage = async (
    messageId: string
  ) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce message ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(messageId);

      const response = await fetch(
        `/api/admin/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de supprimer le message."
        );
      }

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message._id !== messageId
        )
      );

      if (selectedMessageId === messageId) {
        setSelectedMessageId(null);
      }
    } catch (error) {
      console.error(
        "Error deleting message:",
        error
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

      {/* Header */}
      <div className="border-b border-[var(--line)] px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--forest)]">
                Messages
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--forest)] px-2.5 py-1 text-xs font-semibold text-white">
                  {unreadCount} non lu
                  {unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Gérez les demandes et questions de vos clients.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher un message..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--gold)] focus:bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Tous
            <span>{messages.length}</span>
          </FilterButton>

          <FilterButton
            active={filter === "unread"}
            onClick={() => setFilter("unread")}
          >
            Non lus
            <span>{unreadCount}</span>
          </FilterButton>

          <FilterButton
            active={filter === "read"}
            onClick={() => setFilter("read")}
          >
            Lus
            <span>
              {messages.length - unreadCount}
            </span>
          </FilterButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1">

        {/* Message list */}
        <div
          className={`
            w-full overflow-y-auto
            lg:w-[420px]
            lg:border-r
            lg:border-[var(--line)]
            ${selectedMessage ? "hidden lg:block" : "block"}
          `}
        >
          {filteredMessages.length === 0 ? (
            <EmptyState
              search={search}
              filter={filter}
            />
          ) : (
            <div>
              {filteredMessages.map(
                (message) => (
                  <MessageListItem
                    key={message._id}
                    message={message}
                    selected={
                      selectedMessageId ===
                      message._id
                    }
                    onClick={() =>
                      openMessage(message)
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div
          className={`
            flex-1 overflow-y-auto
            ${selectedMessage ? "block" : "hidden lg:block"}
          `}
        >
          {selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              loading={
                loadingId === selectedMessage._id
              }
              onClose={() =>
                setSelectedMessageId(null)
              }
              onToggleRead={() =>
                toggleRead(selectedMessage)
              }
              onDelete={() =>
                deleteMessage(
                  selectedMessage._id
                )
              }
              formatDate={formatDate}
            />
          ) : (
            <div className="hidden h-full items-center justify-center lg:flex">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Mail
                    size={26}
                    className="text-gray-400"
                  />
                </div>

                <h3 className="mt-5 font-semibold text-gray-900">
                  Aucun message sélectionné
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Sélectionnez un message pour
                  afficher son contenu.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Filter Button */
/* ------------------------------------------------ */

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({
  active,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        shrink-0
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-sm
        font-medium
        transition
        ${
          active
            ? "bg-[var(--forest)] text-white"
            : "text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------ */
/* Message List Item */
/* ------------------------------------------------ */

interface MessageListItemProps {
  message: Message;
  selected: boolean;
  onClick: () => void;
}

function MessageListItem({
  message,
  selected,
  onClick,
}: MessageListItemProps) {
  const date = new Date(
    message.createdAt
  );

  const formattedDate =
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        border-b
        border-[var(--line)]
        px-5
        py-4
        text-left
        transition
        ${
          selected
            ? "bg-gray-50"
            : "hover:bg-gray-50"
        }
        ${
          !message.isRead
            ? "bg-white"
            : ""
        }
      `}
    >
      <div className="flex gap-3">

        {/* Avatar */}
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-sm
            font-semibold
            ${
              message.isRead
                ? "bg-gray-100 text-gray-500"
                : "bg-[var(--forest)] text-white"
            }
          `}
        >
          {message.firstName
            .charAt(0)
            .toUpperCase()}
          {message.lastName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`
                  truncate text-sm
                  ${
                    message.isRead
                      ? "font-medium text-gray-700"
                      : "font-semibold text-gray-900"
                  }
                `}
              >
                {message.firstName}{" "}
                {message.lastName}
              </p>

              <p className="truncate text-xs text-gray-400">
                {message.email}
              </p>
            </div>

            <span className="shrink-0 text-[11px] text-gray-400">
              {formattedDate}
            </span>
          </div>

          <p
            className={`
              mt-2
              line-clamp-2
              text-sm
              leading-5
              ${
                message.isRead
                  ? "text-gray-500"
                  : "font-medium text-gray-700"
              }
            `}
          >
            {message.message}
          </p>

          {!message.isRead && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />

              <span className="text-[11px] font-medium text-gray-500">
                Nouveau
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------ */
/* Message Detail */
/* ------------------------------------------------ */

interface MessageDetailProps {
  message: Message;
  loading: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}

function MessageDetail({
  message,
  loading,
  onClose,
  onToggleRead,
  onDelete,
  formatDate,
}: MessageDetailProps) {
  return (
    <div className="flex min-h-full flex-col">

      {/* Detail header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <X size={18} />
          Retour
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleRead}
            disabled={loading}
            title={
              message.isRead
                ? "Marquer comme non lu"
                : "Marquer comme lu"
            }
            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            {message.isRead ? (
              <Mail size={18} />
            ) : (
              <MailOpen size={18} />
            )}
          </button>

          <button
            type="button"
            title="Archiver"
            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Archive size={18} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            title="Supprimer"
            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 md:px-8">

        {/* Sender */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-sm font-semibold text-white">
            {message.firstName
              .charAt(0)
              .toUpperCase()}
            {message.lastName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {message.firstName}{" "}
                  {message.lastName}
                </h2>

                <a
                  href={`mailto:${message.email}`}
                  className="text-sm text-gray-500 hover:text-[var(--forest)]"
                >
                  {message.email}
                </a>
              </div>

              <span className="text-xs text-gray-400">
                {formatDate(
                  message.createdAt
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Subject-like label */}
        <div className="mt-8 flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Demande client
          </span>

          {message.isRead ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <CheckCheck size={14} />
              Lu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Non lu
            </span>
          )}
        </div>

        {/* Message body */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 md:p-8">
          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {message.message}
          </p>
        </div>

        {/* Customer info */}
        <div className="mt-8 rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <User
              size={17}
              className="text-gray-400"
            />

            <h3 className="text-sm font-semibold text-gray-900">
              Informations du client
            </h3>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">
                Nom
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {message.firstName}{" "}
                {message.lastName}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Adresse e-mail
              </p>

              <p className="mt-1 truncate text-sm font-medium text-gray-700">
                {message.email}
              </p>
            </div>
          </div>
        </div>

        {/* Reply */}
        <div className="mt-6">
          <a
            href={`mailto:${message.email}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Mail size={16} />
            Répondre par e-mail
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Empty State */
/* ------------------------------------------------ */

interface EmptyStateProps {
  search: string;
  filter: FilterType;
}

function EmptyState({
  search,
  filter,
}: EmptyStateProps) {
  const hasFilter =
    search.length > 0 || filter !== "all";

  return (
    <div className="flex min-h-[400px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          {hasFilter ? (
            <Search
              size={23}
              className="text-gray-400"
            />
          ) : (
            <Mail
              size={23}
              className="text-gray-400"
            />
          )}
        </div>

        <h3 className="mt-4 font-semibold text-gray-900">
          {hasFilter
            ? "Aucun résultat"
            : "Aucun message"}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {hasFilter
            ? "Essayez une autre recherche ou un autre filtre."
            : "Les messages de vos clients apparaîtront ici."}
        </p>
      </div>
    </div>
  );
}