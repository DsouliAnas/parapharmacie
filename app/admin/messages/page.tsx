import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import MessagesClient from "@/components/admin/MessagesClient";

export default async function MessagesPage() {
  await connectDB();

  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .lean();

  const serializedMessages = messages.map((message) => ({
    _id: String(message._id),
    firstName: message.firstName,
    lastName: message.lastName,
    email: message.email,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  }));

  return (
    <MessagesClient messages={serializedMessages} />
  );
}