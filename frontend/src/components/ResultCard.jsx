import { FileText, GraduationCap, User, Newspaper, Bookmark, Clock, ExternalLink } from 'lucide-react';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { getSavedKey } from '../utils/savedItems';

const iconByType = {
  disciplina: GraduationCap,
  pessoa: User,
  secao_texto: Newspaper,
};

const ResultCard = ({
  document_id,
  source_id,
  tipo_conteudo,
  nome_disciplina,
  periodo,
  curso,
  unidade,
  ementa,
  conteudo,
  titulo_documento,
  titulo_secao,
  nome_pessoa,
  cargo,
  titulacao,
  area_atuacao,
  carga_horaria_total,
  carga_horaria_teorica,
  carga_horaria_pratica,
  carga_horaria_atividade,
  pre_requisitos,
  tags,
  pagina,
  url_documento,
  score,
  max_score,
  highlight,
}) => {
  const { isSaved, toggleSave } = useSavedItems();
  const itemKey = getSavedKey({ document_id, source_id, url_documento, pagina });
  const saved = isSaved(itemKey);

  const isDiscipline = tipo_conteudo === "disciplina";
  const isSection = tipo_conteudo === "secao_texto";
  const isPerson = tipo_conteudo === "pessoa";

  // Determine display title
  let displayTitle = titulo_documento;
  if (isDiscipline && nome_disciplina) displayTitle = nome_disciplina;
  if (isSection && titulo_secao && !titulo_secao.toLowerCase().startsWith("página")) displayTitle = titulo_secao;
  if (isPerson && nome_pessoa) displayTitle = nome_pessoa;

  // Header display context (Course, Unidade, or Document)
  const headerContext = isPerson
    ? (unidade || "UNIFAL-MG")
    : (curso || (displayTitle !== titulo_documento ? titulo_documento : "Documento"));

  const Icon = iconByType[tipo_conteudo] || FileText;

  // Determine main body text (prioritize highlight for better snippets)
  let bodyText = highlight || ementa || conteudo;
  if (!highlight && isPerson) {
      bodyText = conteudo || [cargo, titulacao, area_atuacao].filter(Boolean).join(" • ");
  }
  
  const relevancePercent = max_score > 0 ? Math.round((score / max_score) * 100) : 0;

  const handleClick = () => {
    if (url_documento) {
      window.open(url_documento, "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    toggleSave({
      document_id, source_id, tipo_conteudo, tipo_documento: titulo_documento,
      nome_disciplina, periodo, curso, ementa, conteudo, titulo_documento,
      titulo_secao, nome_pessoa, cargo, titulacao, area_atuacao,
      carga_horaria_total, carga_horaria_teorica, carga_horaria_pratica,
      carga_horaria_atividade, pre_requisitos, tags, pagina, url_documento,
      score, max_score, highlight,
    });
  };

  return (
    <article
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 hover:border-secondary dark:hover:border-secondary hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header: context + relevance */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-unifal-bg dark:bg-gray-700 rounded-full flex shrink-0 items-center justify-center text-primary dark:text-secondary">
            <Icon size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-gray-900 dark:text-on-surface line-clamp-1 leading-tight block">
              {headerContext}
            </span>
            {isPerson && titulacao && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{titulacao}</span>
            )}
            {!isPerson && periodo && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{periodo}º Período</span>
            )}
          </div>
        </div>

        {/* Save action */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            type="button"
            aria-label={saved ? "Remover dos salvos" : "Salvar"}
            className={`transition-colors ${saved ? "text-primary dark:text-secondary" : "text-gray-400 hover:text-primary dark:hover:text-secondary"}`}
            onClick={handleSaveClick}
          >
            <Bookmark
              size={20}
              strokeWidth={1}
              fill={saved ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-on-surface mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
        {displayTitle}
      </h3>

      {/* Body / Summary */}
      {bodyText && (
        <div className="mb-4">
          {isDiscipline && ementa && !highlight && (
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ementa</span>
          )}
          <p 
            className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed ${isDiscipline ? "" : "line-clamp-3"} mt-0.5`}
            dangerouslySetInnerHTML={{ __html: bodyText }}
          />
        </div>
      )}

      {/* Workload bar (only for disciplines) */}
      {isDiscipline && carga_horaria_total && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Clock size={16} aria-hidden="true" />
            C.H Total: <span className="font-bold text-gray-900 dark:text-on-surface">{carga_horaria_total}h</span>
          </div>
          {carga_horaria_teorica != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Teórica: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_teorica}h</span>
            </div>
          )}
          {carga_horaria_pratica != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Prática: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_pratica}h</span>
            </div>
          )}
          {carga_horaria_atividade != null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              Atividade: <span className="font-bold text-gray-800 dark:text-gray-200">{carga_horaria_atividade}h</span>
            </div>
          )}
        </div>
      )}

      {/* Prerequisites (only if present) */}
      {isDiscipline && pre_requisitos && pre_requisitos.length > 0 && (
        <div className="mb-4 text-xs">
          <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pré-requisitos: </span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{pre_requisitos.join(", ")}</span>
        </div>
      )}

      {/* Footer: metadata + relevance + CTA */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-3 md:gap-4 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        {!isPerson && pagina != null && (
          <div className="flex items-center gap-1.5">
            <Newspaper size={16} aria-hidden="true" />
            Página {pagina}
          </div>
        )}
        {!isPerson && pagina != null && <div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>}

        {/* Relevance indicator (fills available space) */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[220px]">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">Relevância</span>
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${relevancePercent}%` }}
              role="progressbar"
              aria-valuenow={relevancePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Relevância da pesquisa: ${relevancePercent}%`}
            ></div>
          </div>
          <span className="text-xs font-bold text-primary dark:text-secondary shrink-0 tabular-nums">{relevancePercent}%</span>
        </div>

        <div className="ml-auto flex items-center gap-1 text-primary dark:text-secondary font-bold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {isPerson ? "Ver Lattes" : "Ver documento"}
          <ExternalLink size={16} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
};

export default ResultCard;
