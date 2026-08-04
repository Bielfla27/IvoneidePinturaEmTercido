package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import br.com.gabrielfelix.ivoneide_pintura_api.order.Order;
import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderStatus;

public class OrderResponse {

	private Long id;
	private Long usuarioId;
	private String usuarioNome;
	private OrderStatus status;
	private BigDecimal valorTotal;
	private LocalDateTime criadoEm;
	private List<OrderItemResponse> itens;

	public OrderResponse(Order order) {
		this.id = order.getId();
		this.usuarioId = order.getUsuario().getId();
		this.usuarioNome = order.getUsuario().getNome();
		this.status = order.getStatus();
		this.valorTotal = order.getValorTotal();
		this.criadoEm = order.getCriadoEm();
		this.itens = order.getItens()
				.stream()
				.map(OrderItemResponse::new)
				.toList();
	}

	public Long getId() {
		return id;
	}

	public Long getUsuarioId() {
		return usuarioId;
	}

	public String getUsuarioNome() {
		return usuarioNome;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public BigDecimal getValorTotal() {
		return valorTotal;
	}

	public LocalDateTime getCriadoEm() {
		return criadoEm;
	}

	public List<OrderItemResponse> getItens() {
		return itens;
	}
}
