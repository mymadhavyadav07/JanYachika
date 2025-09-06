import TransitionWrapper from "@/components/TransitionWrapper";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TransitionWrapper>{children}</TransitionWrapper>;
}
