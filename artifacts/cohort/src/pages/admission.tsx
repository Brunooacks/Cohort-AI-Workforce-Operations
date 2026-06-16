import { AppLayout } from "@/components/layout";
import { useCreateAgent } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading, Eyebrow } from "@/components/cohort";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  role: z.string().min(2, "Papel é obrigatório"),
  platform: z.string().min(1, "Plataforma é obrigatória"),
  bio: z.string().min(10, "Forneça uma breve descrição"),
  businessOwner: z.string().optional(),
  technicalOwner: z.string().optional(),
  autonomyLevel: z.enum(["autonomous", "escalates", "restricted"]).default("escalates"),
});

export default function AdmissionPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createAgent = useCreateAgent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      platform: "openai",
      bio: "",
      businessOwner: "",
      technicalOwner: "",
      autonomyLevel: "escalates",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createAgent.mutate(
      { data: values },
      {
        onSuccess: (agent) => {
          toast({
            title: "Admissão concluída",
            description: "Carteira de Trabalho gerada com sucesso.",
          });
          setLocation(`/agentes/${agent.agent.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro na admissão",
            description: "Ocorreu um erro ao registrar o agente.",
          });
        },
      }
    );
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Workspace" }, { label: "Admissão" }]}>
      <div className="mx-auto max-w-2xl space-y-7 animate-in fade-in duration-500">
        <PageHeading
          eyebrow="Workspace"
          title="Cadastrar agente"
          subtitle="Gere a Carteira de Trabalho para um novo agente ingressar na frota."
        />

        <Card>
          <div className="border-b border-card-border px-6 py-4">
            <Eyebrow>Identidade básica</Eyebrow>
            <p className="mt-0.5 text-sm text-muted-foreground">Informações principais do agente</p>
          </div>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Agente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SupportBot v2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel Funcional</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: L1 Customer Support" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plataforma Base</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a plataforma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI Assistants</SelectItem>
                            <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                            <SelectItem value="langchain">LangChain Custom</SelectItem>
                            <SelectItem value="flowise">Flowise</SelectItem>
                            <SelectItem value="custom">Custom API</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="autonomyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Autonomia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="autonomous">Totalmente Autônomo (Pode agir)</SelectItem>
                            <SelectItem value="escalates">Escalador (Pede ajuda)</SelectItem>
                            <SelectItem value="restricted">Restrito (Apenas rascunho)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Bio)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o propósito deste agente e seu escopo de atuação..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="businessOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dono de Negócio</FormLabel>
                        <FormControl>
                          <Input placeholder="E-mail ou nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="technicalOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dono Técnico</FormLabel>
                        <FormControl>
                          <Input placeholder="E-mail ou nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={createAgent.isPending}>
                    {createAgent.isPending ? "Admitindo..." : "Gerar Carteira de Trabalho"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
